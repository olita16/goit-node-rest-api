import Joi from "joi";
import { emailRegexp, passwordRegexp } from "../constants/authConstants.js";

export const authSignupSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).pattern(passwordRegexp).required(),
});

export const authEmailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
})