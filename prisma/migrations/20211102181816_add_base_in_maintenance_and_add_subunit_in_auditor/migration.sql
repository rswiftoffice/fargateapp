/*
  Warnings:

  - Added the required column `subUnitId` to the `Auditor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseId` to the `MaintenanceAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Auditor" DROP CONSTRAINT "Auditor_baseId_fkey";

-- AlterTable
ALTER TABLE "Auditor" ADD COLUMN     "subUnitId" INTEGER NOT NULL,
ALTER COLUMN "baseId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MaintenanceAdmin" ADD COLUMN     "baseId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Auditor" ADD CONSTRAINT "Auditor_subUnitId_fkey" FOREIGN KEY ("subUnitId") REFERENCES "SubUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditor" ADD CONSTRAINT "Auditor_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAdmin" ADD CONSTRAINT "MaintenanceAdmin_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
