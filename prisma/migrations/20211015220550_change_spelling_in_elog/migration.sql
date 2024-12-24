/*
  Warnings:

  - You are about to drop the column `fuelRecived` on the `ELog` table. All the data in the column will be lost.
  - Added the required column `fuelReceived` to the `ELog` table without a default value. This is not possible if the table is not empty.
  - Made the column `vehiclesPlatformsId` on table `Vehicle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_vehiclesPlatformsId_fkey";

-- AlterTable
ALTER TABLE "ELog" DROP COLUMN "fuelRecived",
ADD COLUMN     "fuelReceived" INTEGER NOT NULL,
ALTER COLUMN "startTime" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "vehiclesPlatformsId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_vehiclesPlatformsId_fkey" FOREIGN KEY ("vehiclesPlatformsId") REFERENCES "VehiclesPlatforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
