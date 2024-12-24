/*
  Warnings:

  - The `requisitionerPurpose` column on the `ELog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `requisitionerPurpose` on the `BOCTrip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `requisitionerPurpose` on the `Destination` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "BOCTrip" DROP COLUMN "requisitionerPurpose",
ADD COLUMN     "requisitionerPurpose" "requisitionerPurpose" NOT NULL;

-- AlterTable
ALTER TABLE "Destination" DROP COLUMN "requisitionerPurpose",
ADD COLUMN     "requisitionerPurpose" "requisitionerPurpose" NOT NULL;

-- AlterTable
ALTER TABLE "ELog" DROP COLUMN "requisitionerPurpose",
ADD COLUMN     "requisitionerPurpose" "requisitionerPurpose";
