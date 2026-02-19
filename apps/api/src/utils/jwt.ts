import { sign, verify } from "jsonwebtoken";
import crypto from "crypto";
import serverConfig from "../config/server.config";

export interface AccessTokenPayload {
  userId: string;
  sessionId: string;
}

export function generateAccessToken(paylaod: AccessTokenPayload) {
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

export function verifyAccessToken(
  token: string,
): AccessTokenPayload | undefined {
  try {
    const decoded = verify(token, serverConfig.JWT_SECRET_KEY!);

    if (typeof decoded === "string") {
      return undefined;
    }

    if (!decoded.userId || !decoded.sessionId) {
      return undefined;
    }

    return decoded as AccessTokenPayload;
  } catch {
    return undefined;
  }
}
