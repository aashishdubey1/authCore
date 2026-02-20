const corsOptions = {
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200,
};
import type { Request, Response } from "express";
import type {
  UserLoginInput,
  UserRegisterInput,
} from "../validation/auth.schema";
import { UserRepository } from "../repositories/User.repository";
import serverConfig from "../config/server.config";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { AuthTokenRepository } from "../repositories/AuthToken.repository";
import { emailService } from "../utils/emailService";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { PrismaClientValidationError } from "../generated/prisma/internal/prismaNamespace";
import { Sessions } from "../repositories/Session.repository";
import { getClientInfo } from "../utils/clientInfo";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { RefreashToken } from "../repositories/RefreshToken.repository";
import prisma from "../config/db.config";
import { TokenType } from "../generated/prisma/enums";

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
      exisitngUser.password,
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
  const token = req.query.token as string;

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

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as UserLoginInput;
  const { ip, deviceInfo, userAgent } = getClientInfo(req);

  const user = await UserRepository.findByEmail(email);

  if (!user)
    return res.status(400).json({ success: false, message: "User not found" });

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword)
    return res
      .status(401)
      .json({ success: false, message: "Invalid Password" });

  if (!user.emailVerified)
    return res
      .status(401)
      .json({ success: false, message: "Email not verified" });

  if (user.accountLocked && user.lockedUntil! > new Date()) {
    const minutes = Math.ceil(
      (user.lockedUntil!.getTime() - Date.now()) / 60000,
    );
    return res.status(401).json({
      success: false,
      message: `Your account is locked. Try again in ${minutes} min.`,
    });
  }

  let session = await Sessions.find(user.id, userAgent, ip!);

  if (!session) {
    session = await Sessions.create(user.id, ip!, userAgent, deviceInfo);
  } else {
    session = await Sessions.update(session.id);
  }
  const { token: refreshToken, tokenHash } = generateRefreshToken();

  await RefreashToken.create(session.id, tokenHash);

  const accessToken = generateAccessToken({
    userId: user.id,
    sessionId: session.id,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: serverConfig.BUN_ENV === "production",
    sameSite: "strict",
    path: "/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login Successfull",
    accessToken,
    sessionId: session.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  const sessionId = req.user?.sessionId;

  if (!sessionId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  try {
    await prisma.$transaction(async (tx) => {
      await RefreashToken.revoke(sessionId, tx);
      await Sessions.deactivate(sessionId, tx);
    });

    res.clearCookie("refreshToken");

    res.status(200).json({ success: true, message: "Logout Successfully" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

export const logoutAll = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Invalid session Id",
    });
  }
  try {
    await prisma.$transaction(async (tx) => {
      await Sessions.deactivateAll(userId, tx);
      await RefreashToken.revokeAll(userId, tx);
    });

    res.clearCookie("refreshToken");
    res.status(200).json({ success: true, message: "Logout Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  res.status(200).send("NOT IMPLEMENTED YET");
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await UserRepository.findByEmail(email);

  if (!user) {
    return res
      .status(200)
      .json({ success: true, message: "If account exists, reset link sent" });
  }

  const token = crypto.randomBytes(30).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  await AuthTokenRepository.create(
    tokenHash,
    user.id,
    expiresAt,
    TokenType.PASSWORD_RESET,
  );

  if (serverConfig.BUN_ENV === "production") {
    // await emailService.sendVerificationEmail(user.email, token);
  } else {
    console.log(`http://localhost:3000/reset-token/${token}`);
  }
  return res
    .status(200)
    .json({ success: true, message: "If account exists, reset link sent" });
};
