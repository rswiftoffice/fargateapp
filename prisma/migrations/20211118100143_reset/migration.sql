/*
  Warnings:

  - Changed the type of `requisitionerPurpose` on the `Destination` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Destination" DROP COLUMN "requisitionerPurpose",
ADD COLUMN     "requisitionerPurpose" TEXT NOT NULL;
