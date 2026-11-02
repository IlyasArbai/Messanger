import express from "express";
import { AuthController } from "./controller.js";
import { authenticate, validate } from "#src/utils/middlewares.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "./validator.js";

const router = express.Router();

router.post("/me", authenticate, AuthController.check);
router.post("/logout", authenticate, AuthController.logout);
router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
router.patch(
  "/password",
  authenticate,
  validate(changePasswordSchema),
  AuthController.changePassword,
);

export default router;
