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
