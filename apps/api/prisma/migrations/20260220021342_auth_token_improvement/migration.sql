/*
  Warnings:

  - You are about to drop the column `replacedById` on the `refresh_token` table. All the data in the column will be lost.
  - You are about to drop the column `mfaSecret` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- DropIndex
DROP INDEX "verification_tokens_user_id_key";

-- AlterTable
ALTER TABLE "refresh_token" DROP COLUMN "replacedById",
ADD COLUMN     "replace_by_id" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "mfaSecret",
ADD COLUMN     "mfa_secret" TEXT;

-- AlterTable
ALTER TABLE "verification_tokens" ADD COLUMN     "type" "TokenType" NOT NULL DEFAULT 'EMAIL_VERIFICATION';
