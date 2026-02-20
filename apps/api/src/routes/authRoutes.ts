import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  logoutAll,
  refresh,
  register,
  resendVerificationCode,
  verifyEmail,
} from "../controller/auth.controller";
import { validate, validateQuery } from "../middlewares/inputValidate";
import {
  forgotPasswordSchema,
  resendVerificationCodeSchema,
  userLoginSchema,
  userRegistrationSchema,
  verifyEmailSchema,
} from "../validation/auth.schema";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post("/register", validate(userRegistrationSchema), register);

router.get("/verify-email", validateQuery(verifyEmailSchema), verifyEmail);

router.post(
  "/resend-verification",
  validate(resendVerificationCodeSchema),
  resendVerificationCode,
);

router.post("/login", validate(userLoginSchema), login);

router.post("/logout", authenticate, logout);

router.post("/logout-all", authenticate, logoutAll);

router.post("/refresh", refresh);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);

// router.post("/change-password", () => {});

// router.post("/reset-password", () => {});

// router.get("/sessions", () => {});

// router.delete("/sessions/:sessionId");

// router.get("/session/current");

// router.post("/mfa/setup", () => {});

// router.post("/mfa/verify", () => {});

// router.post("/mfa/verify-login", () => {});

// router.post("/mfa/disable", () => {});

// router.post("/mfa/regenerate-backup-codes", () => {});

// router.post("/mfa/verify-backup-code", () => {});

export default router;
