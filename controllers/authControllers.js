import HttpError from "../helpers/HttpError.js";
import * as authServices from "../services/authServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import User from "../db/models/User.js";
import bcrypt from "bcryptjs";
import gravatar from "gravatar";
import path from "path";
import * as fs from "node:fs/promises";

import jwt from "jsonwebtoken";
const { JWT_SECRET } = process.env;

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


export const register = async (req, res, next) => {
  try {
    const { email, password, subscription } = req.body;

    if (!email || !password) {
      return next(HttpError(400, "Email and password are required"));
    }

    const avatarURL = gravatar.url(
      email,
      { s: "200", r: "pg", d: "retro" },
      true
    );

    const newUser = await authServices.signup({
      email,
      password,
      subscription,
      avatarURL,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    if (error.message === "Email already in use") {
      return next(HttpError(409, "Email already in use"));
    }
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
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  updateAvatar: ctrlWrapper(updateAvatar),
};
