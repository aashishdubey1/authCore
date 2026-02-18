import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.includes("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    res.status(400).json({ success: false, message: "No token found" });
  }

  try {
    const decoded = verifyAccessToken(token!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid Token" });
  }
};
