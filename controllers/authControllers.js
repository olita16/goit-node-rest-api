import HttpError from "../helpers/HttpError.js";
import * as authServices from "../services/authServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import User from "../db/models/User.js";
import bcrypt from "bcryptjs";
import gravatar from "gravatar";
import path from "path";
import * as fs from "node:fs/promises";
import { nanoid } from "nanoid";
import nodemailer from "nodemailer";

import jwt from "jsonwebtoken";

const { JWT_SECRET, UKR_NET_PASSWORD, UKR_NET_FROM } = process.env;

const avatarPath = path.resolve("public", "avatars");

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw HttpError(400, "No file uploaded");
    }

    const { id } = req.user;
    const { path: oldPath, filename } = req.file;
    const newPath = path.join(avatarPath, filename);
    const avatarURL = `/avatars/${filename}`;

    await fs.rename(oldPath, newPath);

    const updatedUser = await authServices.updateUser(id, { avatarURL });

    res.json({
      avatarURL: updatedUser.avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

const FROM_EMAIL = "olena.trzewik@ukr.net";

const transporter = nodemailer.createTransport({
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: UKR_NET_FROM,
    pass: UKR_NET_PASSWORD,
  },
});

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw HttpError(
        400,
        "Validation error: email and password are required."
      );
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw HttpError(409, "Conflict: Email is already in use.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email, { s: "200", r: "pg", d: "mm" });
    const verificationToken = nanoid();

    const newUser = await User.create({
      email,
      password: hashedPassword,
      avatarURL,
      verificationToken,
    });

    const verificationLink = `http://localhost:3000/auth/verify/${verificationToken}`;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your email",
      html: `<a href="${verificationLink}">Click here to verify your email</a>`,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOne({ where: { verificationToken } });

    if (!user) {
      throw HttpError(404, "User not found");
    }

    user.verify = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw HttpError(400, "Missing required field email");
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw HttpError(404, "User not found");
    }

    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }

    const verificationLink = `http://localhost:3000/auth/verify/${user.verificationToken}`;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Email Verification",
      html: `<a href="${verificationLink}">Click here to verify your email</a>`,
    });

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.findUser({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  const payload = {
    id: user.id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  await authServices.updateUser({ id: user.id }, { token });
  res.json({
    token,
    user: { email: user.email, subscription: user.subscription },
  });
};

export const logout = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await User.findByPk(id);
    if (!user) {
      throw HttpError(401, "Not authorized");
    }

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await User.findByPk(id);

    if (!user) {
      return next(HttpError(401, "Not authorized"));
    }

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register: ctrlWrapper(register),
  verifyUser: ctrlWrapper(verifyUser),
  resendVerificationEmail: ctrlWrapper(resendVerificationEmail),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  updateAvatar: ctrlWrapper(updateAvatar),
};
