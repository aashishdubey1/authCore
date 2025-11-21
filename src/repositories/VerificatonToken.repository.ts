import prisma from "../config/db.config";

export class VerificationCode {
  static async create(token: string, userId: string, expiresAt: Date) {
    return await prisma.verificationToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }
}
