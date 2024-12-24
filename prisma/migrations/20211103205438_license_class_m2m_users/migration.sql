/*
  Warnings:

  - You are about to drop the column `userId` on the `LicenseClass` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LicenseClass" DROP CONSTRAINT "LicenseClass_userId_fkey";

-- AlterTable
ALTER TABLE "LicenseClass" DROP COLUMN "userId";
