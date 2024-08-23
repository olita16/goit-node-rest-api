import HttpError from "../helpers/HttpError.js";
import * as authServices from "../services/authServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import User from "../db/models/User.js";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
const { JWT_SECRET } = process.env;

export const register = async (req, res, next) => {
  try {
    const newUser = await authServices.signup(req.body);
    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
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
};
