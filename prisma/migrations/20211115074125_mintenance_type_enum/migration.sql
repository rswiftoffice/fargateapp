/*
  Warnings:

  - Changed the type of `maintenanceType` on the `VehicleServicing` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "VehicleServicing" DROP COLUMN "maintenanceType",
ADD COLUMN     "maintenanceType" "CheckInOutType" NOT NULL;
