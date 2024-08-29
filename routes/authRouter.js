import express from "express";
import authControllers from "../controllers/authControllers.js";
import authenticate from "../middlewares/authenticate.js";

import upload from "../middlewares/upload.js";

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
authRouter.get("/verify/:verificationToken", authControllers.verifyUser);
authRouter.post("/verify", authControllers.resendVerificationEmail);

export default authRouter;
