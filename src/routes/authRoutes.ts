import { Router } from "express";
import { register } from "../controller/auth.controller";
import { validate } from "../middlewares/inputValidate";
import { userRegistrationSchema } from "../validation/auth.schema";

const router = Router();

router.post("/register", validate(userRegistrationSchema), register);

// router.post("/login", () => {});

// router.post("/logout", () => {});

// router.post("/logout-all", () => {});

// router.post("/refresh", () => {});

// router.get("/verify-email/:token", () => {});

// router.post("/resend-verification", () => {});

// router.post("/forgot-password", () => {});

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
