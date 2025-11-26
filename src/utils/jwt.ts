import { type JwtPayload, sign, verify } from "jsonwebtoken";
import crypto from "crypto";
import serverConfig from "../config/server.config";

export function generateAccessToken(paylaod: JwtPayload) {
  const token = sign(paylaod, serverConfig.JWT_SECRET_KEY!, {
    expiresIn: "15m",
  });
  return token;
}

export function generateRefreshToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(48).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}
