import prisma from "../config/db.config";
import type { VerificationToken } from "../generated/prisma/client";

export class VerificationCode {
  static async create(
    token: string,
    userId: string,
    expiresAt: Date
  ): Promise<VerificationToken> {
    return await prisma.verificationToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  static async update(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<VerificationToken> {
    return await prisma.verificationToken.update({
      where: { userId },
      data: { token, expiresAt, isUsed: false },
    });
  }

  static async find(tokenHash: string) {
    return await prisma.verificationToken.findFirst({
      where: { token: tokenHash },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }

  static async markUsed(id: string) {
    return prisma.verificationToken.update({
      where: { id },
      data: { isUsed: true },
    });
  }
}
