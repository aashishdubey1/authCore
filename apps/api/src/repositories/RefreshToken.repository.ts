import type { PrismaClient } from "@prisma/client/extension";
import prisma from "../config/db.config";

export class RefreashToken {
  static async create(sessionId: string, tokenHash: string) {
    return prisma.refreshToken.create({
      data: {
        sessionId,
        tokenHash,
        revoked: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 1000 * 60 * 60),
      },
    });
  }

  static async revoke(sessionId: string, tx: PrismaClient = prisma) {
    return tx.refreshToken.updateMany({
      where: { sessionId, revoked: false },
      data: { revoked: true, updatedAt: new Date() },
    });
  }

  static async revokeAll(userId: string, tx: PrismaClient = prisma) {
    return tx.refreshToken.updateMany({
      where: {
        session: { userId },
      },
      data: { revoked: true, updatedAt: new Date() },
    });
  }
}
