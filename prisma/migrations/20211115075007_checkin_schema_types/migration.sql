/*
  Warnings:

  - Changed the type of `expectedCheckoutDate` on the `CheckIn` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `expectedCheckoutTime` on the `CheckIn` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CheckIn" DROP COLUMN "expectedCheckoutDate",
ADD COLUMN     "expectedCheckoutDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "expectedCheckoutTime",
ADD COLUMN     "expectedCheckoutTime" TIMESTAMP(3) NOT NULL;
