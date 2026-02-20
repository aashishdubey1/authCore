import prisma from "../config/db.config";
import { TokenType, type AuthToken } from "../generated/prisma/client";

export class AuthTokenRepository {
  static async create(
    token: string,
    userId: string,
    expiresAt: Date,
    tokenType: TokenType = TokenType.EMAIL_VERIFICATION,
  ): Promise<AuthToken> {
    return await prisma.authToken.create({
      data: {
        userId,
        token,
        type: tokenType,
        expiresAt,
      },
    });
  }

  // static async update(
  //   userId: string,
  //   token: string,
  //   type: TokenType,
  //   expiresAt: Date,
  // ): Promise<AuthToken> {
  //   return await prisma.authToken.updateMa({
  //     where: { userId, type },
  //     data: { token, expiresAt, isUsed: false },
  //   });
  // }

  static async find(tokenHash: string) {
    return await prisma.authToken.findFirst({
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
    return prisma.authToken.update({
      where: { id },
      data: { isUsed: true },
    });
  }
}
