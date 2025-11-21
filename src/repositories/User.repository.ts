import prisma from "../config/db.config";
import type { User } from "../generated/prisma/client";
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
}
