import HttpError from "../helpers/HttpError.js";
import { ValidationError } from "sequelize";

const validateBody = (schema) => {
  const func = (req, _, next) => {
    const { error } = schema.validate(req.body);
    if (error instanceof ValidationError) {
      next(HttpError(400, error.message));
    }
    next();
  };

  return func;
};

export default validateBody;
