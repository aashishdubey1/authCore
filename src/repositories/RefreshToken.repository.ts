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
}
