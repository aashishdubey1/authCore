import prisma from "../config/db.config";
import type { Session } from "../generated/prisma/client";

export class Sessions {
  static async create(
    userId: string,
    ip: string,
    userAgent: string,
    deviceInfo: string
  ) {
    return prisma.session.create({
      data: {
        userId,
        userAgent,
        ipAddress: ip,
        device: deviceInfo,
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  static async find(userId: string, userAgent: string, ipAddress: string) {
    return prisma.session.findFirst({
      where: {
        userId,
        userAgent,
        ipAddress,
        isActive: true,
      },
    });
  }

  static async update(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: {
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
}
