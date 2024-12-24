/*
  Warnings:

  - You are about to drop the column `image` on the `CheckIn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CheckIn" DROP COLUMN "image",
ADD COLUMN     "fileId" INTEGER;

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "originalName" TEXT NOT NULL,
    "encoding" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
