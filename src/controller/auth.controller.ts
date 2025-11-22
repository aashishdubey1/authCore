import type { Request, Response } from "express";
import type { UserRegisterInput } from "../validation/auth.schema";
import { UserRepository } from "../repositories/User.repository";
import serverConfig from "../config/server.config";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { VerificationCode } from "../repositories/VerificatonToken.repository";
import { emailService } from "../utils/emailService";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { PrismaClientValidationError } from "../generated/prisma/internal/prismaNamespace";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as UserRegisterInput;
  try {
    const exisitngUser = await UserRepository.findByEmail(email);

    if (exisitngUser)
      return res
        .status(400)
        .json({ success: false, message: "User alredy Exists" });

    const hashedPass = await bcrypt.hash(password, 12);

    const newUser = await UserRepository.create({
      name,
      email,
      password: hashedPass,
    });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await VerificationCode.create(tokenHash, newUser.id, expiresAt);

    if (serverConfig.BUN_ENV === "production") {
      await emailService.sendVerificationEmail(newUser.email, token);
    } else {
      console.log(`${serverConfig.APP_URL}/verify-email?token=${token}`);
    }

    return res
      .status(201)
      .json({ success: true, message: "Verification code sent to your email" });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.log("Known Request Error:", error.message);
    }

    if (error instanceof PrismaClientValidationError) {
      console.log("Validation Error:", error.message);
    }

    console.log("RAW ERROR:", error);
  }
  res.send(500).json({ success: false, message: "Internal Server Error" });
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const exisitngUser = await UserRepository.findByEmail(email);

    if (!exisitngUser)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      exisitngUser.password
    );
    if (!isPasswordCorrect)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect Password" });

    const isEmailVerified = exisitngUser.emailVerified;
    if (isEmailVerified)
      return res
        .status(404)
        .json({ status: false, message: "Email is already verified" });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await VerificationCode.update(exisitngUser.id, tokenHash, expiresAt);

    if (serverConfig.BUN_ENV === "production") {
      await emailService.sendVerificationEmail(exisitngUser.email, token);
    } else {
      console.log(`${serverConfig.APP_URL}/verify-email?token=${token}`);
    }

    return res.status(201).json({
      success: true,
      message: "Verification code resent successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || Array.isArray(token) || typeof token !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid token",
    });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const existingToken = await VerificationCode.find(tokenHash);

    if (!existingToken)
      return res
        .status(400)
        .json({ status: false, message: "Invalid or expired token" });

    if (existingToken.isUsed)
      return res
        .status(400)
        .json({ status: false, message: "Token has already been used" });

    if (existingToken.expiresAt.getTime() < Date.now())
      return res
        .status(400)
        .json({ success: false, message: "Token has expired" });

    await UserRepository.verifyEmail(existingToken.userId);

    await VerificationCode.markUsed(existingToken.id);

    return res.status(200).json({ success: true, message: "Email Verified" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server error" });
  }
};
