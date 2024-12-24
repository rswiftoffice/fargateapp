/*
  Warnings:

  - You are about to drop the `_CheckInToFile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CheckInToFile" DROP CONSTRAINT "_CheckInToFile_A_fkey";

-- DropForeignKey
ALTER TABLE "_CheckInToFile" DROP CONSTRAINT "_CheckInToFile_B_fkey";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "checkInId" INTEGER;

-- DropTable
DROP TABLE "_CheckInToFile";

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckIn"("id") ON DELETE SET NULL ON UPDATE CASCADE;
