import bcrypt from "bcryptjs";
import User from "../db/models/User.js";
import { nanoid } from "nanoid";

const { BASE_URL } = process.env;

export const findUser = (query) =>
  User.findOne({
    where: query,
  });

export const signup = async (data) => {
  try {
    const { password, email, subscription } = data;
    const hashPassword = await bcrypt.hash(password, 10);
    const verificationToken = nanoid();

    const newUser = await User.create({
      ...data,
      password: hashPassword,
      verificationToken,
    });

    return newUser;
  } catch (error) {
    if (error?.parent?.code === "23505") {
      error.message = "Email already in use";
    }
    throw error;
  }
};

export const updateUser = async (query, data) => {
  const user = await findUser(query);
  if (!user) {
    return null;
  }
  return user.update(data, {
    returning: true,
  });
};
