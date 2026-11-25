import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { registerSchema, loginSchema } from "./auth.schema";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  authController.register.bind(authController)
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController)
);

router.get(
  "/me",
  authenticateUser,
  authController.getMe.bind(authController)
);

router.post(
  "/logout",
  authController.logout.bind(authController)
);

export default router;
