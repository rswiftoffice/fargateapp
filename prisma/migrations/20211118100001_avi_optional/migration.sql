/*
  Warnings:

  - You are about to drop the column `image` on the `CheckIn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CheckIn" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "Trip" ALTER COLUMN "aviDate" DROP NOT NULL;

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "checkInId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckIn"("id") ON DELETE SET NULL ON UPDATE CASCADE;
