/*
  Warnings:

  - Changed the type of `nextServicingMileage` on the `PreventiveMaintenanceCheckOut` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PreventiveMaintenanceCheckOut" DROP COLUMN "nextServicingMileage",
ADD COLUMN     "nextServicingMileage" INTEGER NOT NULL;
