-- CreateEnum
CREATE TYPE "requisitionerPurpose" AS ENUM ('BOS', 'AOS', 'POL');

-- DropForeignKey
ALTER TABLE "ELog" DROP CONSTRAINT "ELog_destinationId_fkey";

-- AlterTable
ALTER TABLE "ELog" ALTER COLUMN "destinationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ELog" ADD CONSTRAINT "ELog_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;
