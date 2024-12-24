/*
  Warnings:

  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_checkInId_fkey";

-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "image" TEXT;

-- DropTable
DROP TABLE "File";
