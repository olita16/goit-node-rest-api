import Joi from "joi";

export const createContactSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({ "any.required": "name has be exist" }),
  email: Joi.string()
    .required()
    .messages({ "any.required": "email has be exist" }),
  phone: Joi.string()
    .required()
    .messages({ "any.required": "phone has be exist" }),
  favorite: Joi.boolean(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
});
