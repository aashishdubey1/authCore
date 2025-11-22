import prisma from "../config/db.config";
import type { User } from "../generated/prisma/client";
import type { UserUpdateInput } from "../generated/prisma/models";
import type { UserRegisterInput } from "../validation/auth.schema";

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { email, isDeleted: false },
    });
    return user;
  }

  static async create(data: UserRegisterInput): Promise<User> {
    const user = await prisma.user.create({ data });
    return user;
  }

  static async update(userId: string, data: UserUpdateInput) {
    return prisma.user.update({ where: { id: userId }, data: { ...data } });
  }

  static async verifyEmail(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }
}
