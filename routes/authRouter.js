import express from "express";
import authControllers from "../controllers/authControllers.js";
import authenticate from "../middlewares/authenticate.js";

import upload from "../middlewares/upload.js";
import validateBody from "../decorators/validateBody.js";

import {authEmailSchema} from "../schemas/authSchemas.js";

const verifyEmailMiddleware = validateBody(authEmailSchema);


const authRouter = express.Router();

authRouter.post("/register", authControllers.register);
authRouter.post("/login", authControllers.login);
authRouter.post("/logout", authenticate, authControllers.logout);
authRouter.get("/current", authenticate, authControllers.getCurrentUser);
authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  authControllers.updateAvatar
);
authRouter.get("/verify/:verificationToken", authControllers.verify);
authRouter.post("/verify", verifyEmailMiddleware, authControllers.resendVerify);

export default authRouter;

