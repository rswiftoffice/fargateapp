/*
  Warnings:

  - Added the required column `file` to the `MTBroadcast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MTBroadcast" ADD COLUMN     "file" TEXT NOT NULL;
ALTER TABLE "MTBroadcast" ADD COLUMN     "subUnitId" INTEGER NOT NULL;
