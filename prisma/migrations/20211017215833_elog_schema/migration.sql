-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "ELog" ALTER COLUMN "endTime" DROP NOT NULL,
ALTER COLUMN "stationaryRunningTime" DROP NOT NULL,
ALTER COLUMN "fuelType" DROP NOT NULL,
ALTER COLUMN "POSONumber" DROP NOT NULL,
ALTER COLUMN "requisitionerPurpose" DROP NOT NULL,
ALTER COLUMN "fuelReceived" DROP NOT NULL;
