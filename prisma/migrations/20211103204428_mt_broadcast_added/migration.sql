/*
  Warnings:

  - You are about to drop the column `baseId` on the `Auditor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Auditor" DROP CONSTRAINT "Auditor_baseId_fkey";

-- AlterTable
ALTER TABLE "Auditor" DROP COLUMN "baseId";

-- CreateTable
CREATE TABLE "MTBroadcast" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MTBroadcast_pkey" PRIMARY KEY ("id")
);
