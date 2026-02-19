export interface UserUpdateInput {
  name?: string;
  emailVerified?: boolean;
  password?: string;
  lastLoginAt?: Date;
}
