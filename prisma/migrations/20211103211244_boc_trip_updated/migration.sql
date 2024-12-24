/*
  Warnings:

  - You are about to drop the column `eLogsId` on the `BOCTrip` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eLogId]` on the table `BOCTrip` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eLogId` to the `BOCTrip` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BOCTrip" DROP CONSTRAINT "BOCTrip_eLogsId_fkey";

-- AlterTable
ALTER TABLE "BOCTrip" DROP COLUMN "eLogsId",
ADD COLUMN     "eLogId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BOCTrip_eLogId_key" ON "BOCTrip"("eLogId");

-- AddForeignKey
ALTER TABLE "BOCTrip" ADD CONSTRAINT "BOCTrip_eLogId_fkey" FOREIGN KEY ("eLogId") REFERENCES "ELog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
