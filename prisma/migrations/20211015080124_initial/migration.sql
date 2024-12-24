-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'SERVICES', 'COMMAND', 'BASE', 'SUB_UNIT', 'MAINTENANCE', 'AUDITOR', 'DRIVER', 'PRE_APPROVED_DRIVER', 'MAC', 'APPROVING_OFFICER');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('RESET_PASSWORD');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('LOCAL', 'MICROSOFT');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('Approved', 'Rejected', 'Pending');

-- CreateEnum
CREATE TYPE "DestinationStatus" AS ENUM ('Review', 'InProgress', 'Inactive', 'Completed');

-- CreateEnum
CREATE TYPE "TripApprovalStatus" AS ENUM ('Approved', 'Rejected', 'Pending', 'Cancelled');

-- CreateEnum
CREATE TYPE "MTRACFormStatus" AS ENUM ('Review', 'Approved', 'Deny');

-- CreateEnum
CREATE TYPE "FrontSensorTag" AS ENUM ('Yes', 'No');

-- CreateEnum
CREATE TYPE "CheckInOutType" AS ENUM ('Preventive', 'Corrective', 'AVI');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('Diesel', 'Petrol');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('Vehicle', 'Motorcycle');

-- CreateEnum
CREATE TYPE "FilledBy" AS ENUM ('FrontPassenger', 'VehicleCommander');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('Inactive', 'InProgress', 'Completed');

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "name" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "provider" "Provider" NOT NULL DEFAULT E'LOCAL',
    "subUnitId" INTEGER,
    "adminSubUnitId" INTEGER,
    "serviceId" INTEGER,
    "commandId" INTEGER,
    "baseAdminId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "handle" TEXT NOT NULL,
    "hashedSessionToken" TEXT,
    "antiCSRFToken" TEXT,
    "publicData" TEXT,
    "privateData" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentTo" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "tripDate" TIMESTAMP(3) NOT NULL,
    "approvalStatus" "TripApprovalStatus" NOT NULL DEFAULT E'Pending',
    "currentMeterReading" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tripStatus" "TripStatus" NOT NULL DEFAULT E'Inactive',
    "endedAt" TIMESTAMP(3),
    "aviDate" TIMESTAMP(3) NOT NULL,
    "driverId" INTEGER NOT NULL,
    "vehiclesId" INTEGER NOT NULL,
    "approvingOfficerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" SERIAL NOT NULL,
    "to" TEXT NOT NULL,
    "requisitionerPurpose" TEXT NOT NULL,
    "details" TEXT,
    "isAdHocDestination" BOOLEAN NOT NULL DEFAULT false,
    "status" "DestinationStatus" NOT NULL DEFAULT E'Inactive',
    "tripId" INTEGER NOT NULL,
    "approvingOfficerId" INTEGER,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT E'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ELog" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "stationaryRunningTime" INTEGER NOT NULL,
    "meterReading" INTEGER NOT NULL DEFAULT 0,
    "totalDistance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fuelRecived" INTEGER NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "remarks" TEXT,
    "POSONumber" INTEGER NOT NULL,
    "requisitionerPurpose" TEXT NOT NULL,
    "vehicleNumber" INTEGER NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ELog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BOCTrip" (
    "id" SERIAL NOT NULL,
    "tripDate" TIMESTAMP(3) NOT NULL,
    "requisitionerPurpose" TEXT NOT NULL,
    "currentMeterReading" INTEGER NOT NULL,
    "eLogsId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BOCTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Base" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "commandId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubUnit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Updates" (
    "id" SERIAL NOT NULL,
    "notes" TEXT NOT NULL,
    "dateOfCompletion" TIMESTAMP(3) NOT NULL,
    "vehicleServicingId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BasicIssueTools" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "checkInId" INTEGER,
    "checkOutId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BasicIssueTools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "isServiceable" BOOLEAN NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "subUnitId" INTEGER,
    "vehiclesPlatformsId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehiclesPlatforms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "licenseClassId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehiclesPlatforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleServicing" (
    "id" SERIAL NOT NULL,
    "maintenanceType" TEXT NOT NULL,
    "status" "DestinationStatus" NOT NULL DEFAULT E'InProgress',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vehicleId" INTEGER NOT NULL,

    CONSTRAINT "VehicleServicing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quizzes" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "MTRACFormId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" SERIAL NOT NULL,
    "workCenter" TEXT NOT NULL,
    "telephoneNo" TEXT NOT NULL,
    "image" TEXT,
    "dateIn" TIMESTAMP(3) NOT NULL,
    "speedoReading" TEXT NOT NULL,
    "swdReading" TEXT,
    "expectedCheckoutDate" TEXT NOT NULL,
    "expectedCheckoutTime" TEXT NOT NULL,
    "handedBy" TEXT NOT NULL,
    "attender" TEXT NOT NULL,
    "checkInType" "CheckInOutType" NOT NULL,
    "frontSensorTag" "FrontSensorTag" NOT NULL,
    "vehicleServicingId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveMaintenanceCheckIn" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "defect" TEXT NOT NULL,
    "checkinId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveMaintenanceCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveMaintenanceCheckIn" (
    "id" SERIAL NOT NULL,
    "correctiveMaintenance" TEXT NOT NULL,
    "checkinId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorrectiveMaintenanceCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualVehicleInspectionCheckIn" (
    "id" SERIAL NOT NULL,
    "defect" TEXT NOT NULL,
    "checkinId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualVehicleInspectionCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckOut" (
    "id" SERIAL NOT NULL,
    "dateOut" TIMESTAMP(3) NOT NULL,
    "speedoReading" TEXT NOT NULL,
    "swdReading" TEXT,
    "time" TIMESTAMP(3) NOT NULL,
    "remark" TEXT,
    "attendedBy" TEXT NOT NULL,
    "workCenter" TEXT NOT NULL,
    "vehicleTakenOver" TEXT NOT NULL,
    "checkOutType" "CheckInOutType" NOT NULL,
    "vehicleServicingId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckOut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreventiveMaintenanceCheckOut" (
    "id" SERIAL NOT NULL,
    "nextServicingDate" TIMESTAMP(3) NOT NULL,
    "nextServicingMileage" TIMESTAMP(3) NOT NULL,
    "checkOutId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreventiveMaintenanceCheckOut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualVehicleInspectionCheckOut" (
    "id" SERIAL NOT NULL,
    "nextAVIDate" TIMESTAMP(3) NOT NULL,
    "checkOutID" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualVehicleInspectionCheckOut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningVideos" (
    "id" SERIAL NOT NULL,
    "video" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningVideos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseClass" (
    "id" SERIAL NOT NULL,
    "class" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MTRACForm" (
    "id" SERIAL NOT NULL,
    "overAllRisk" TEXT NOT NULL,
    "despatchDate" TIMESTAMP(3) NOT NULL,
    "despatchTime" TIMESTAMP(3) NOT NULL,
    "relaseDate" TIMESTAMP(3) NOT NULL,
    "relaseTime" TIMESTAMP(3) NOT NULL,
    "isAdditionalDetailApplicable" BOOLEAN NOT NULL,
    "driverRiskAssessmentChecklist" TEXT[],
    "otherRiskAssessmentChecklist" TEXT[],
    "safetyMeasures" TEXT,
    "rankAndName" TEXT,
    "personalPin" TEXT,
    "filledBy" "FilledBy",
    "status" "MTRACFormStatus" NOT NULL,
    "tripId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MTRACForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Command" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "Command_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "baseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auditor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceAdmin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "currentRole" "Role" NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RolesToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_name_key" ON "Roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session_handle_key" ON "Session"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Token_hashedToken_type_key" ON "Token"("hashedToken", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ELog_destinationId_key" ON "ELog"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "Base_name_key" ON "Base"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicleNumber_key" ON "Vehicle"("vehicleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_vehicleServicingId_key" ON "CheckIn"("vehicleServicingId");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveMaintenanceCheckIn_checkinId_key" ON "PreventiveMaintenanceCheckIn"("checkinId");

-- CreateIndex
CREATE UNIQUE INDEX "CorrectiveMaintenanceCheckIn_checkinId_key" ON "CorrectiveMaintenanceCheckIn"("checkinId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnualVehicleInspectionCheckIn_checkinId_key" ON "AnnualVehicleInspectionCheckIn"("checkinId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckOut_vehicleServicingId_key" ON "CheckOut"("vehicleServicingId");

-- CreateIndex
CREATE UNIQUE INDEX "PreventiveMaintenanceCheckOut_checkOutId_key" ON "PreventiveMaintenanceCheckOut"("checkOutId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnualVehicleInspectionCheckOut_checkOutID_key" ON "AnnualVehicleInspectionCheckOut"("checkOutID");

-- CreateIndex
CREATE UNIQUE INDEX "MTRACForm_tripId_key" ON "MTRACForm"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "Auditor_userId_key" ON "Auditor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceAdmin_userId_key" ON "MaintenanceAdmin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_RolesToUser_AB_unique" ON "_RolesToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RolesToUser_B_index" ON "_RolesToUser"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_subUnitId_fkey" FOREIGN KEY ("subUnitId") REFERENCES "SubUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_adminSubUnitId_fkey" FOREIGN KEY ("adminSubUnitId") REFERENCES "SubUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_baseAdminId_fkey" FOREIGN KEY ("baseAdminId") REFERENCES "Base"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_vehiclesId_fkey" FOREIGN KEY ("vehiclesId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_approvingOfficerId_fkey" FOREIGN KEY ("approvingOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_approvingOfficerId_fkey" FOREIGN KEY ("approvingOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ELog" ADD CONSTRAINT "ELog_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOCTrip" ADD CONSTRAINT "BOCTrip_eLogsId_fkey" FOREIGN KEY ("eLogsId") REFERENCES "ELog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOCTrip" ADD CONSTRAINT "BOCTrip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BOCTrip" ADD CONSTRAINT "BOCTrip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Base" ADD CONSTRAINT "Base_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "Command"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubUnit" ADD CONSTRAINT "SubUnit_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Updates" ADD CONSTRAINT "Updates_vehicleServicingId_fkey" FOREIGN KEY ("vehicleServicingId") REFERENCES "VehicleServicing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasicIssueTools" ADD CONSTRAINT "BasicIssueTools_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckIn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BasicIssueTools" ADD CONSTRAINT "BasicIssueTools_checkOutId_fkey" FOREIGN KEY ("checkOutId") REFERENCES "CheckOut"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_subUnitId_fkey" FOREIGN KEY ("subUnitId") REFERENCES "SubUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_vehiclesPlatformsId_fkey" FOREIGN KEY ("vehiclesPlatformsId") REFERENCES "VehiclesPlatforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiclesPlatforms" ADD CONSTRAINT "VehiclesPlatforms_licenseClassId_fkey" FOREIGN KEY ("licenseClassId") REFERENCES "LicenseClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleServicing" ADD CONSTRAINT "VehicleServicing_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quizzes" ADD CONSTRAINT "Quizzes_MTRACFormId_fkey" FOREIGN KEY ("MTRACFormId") REFERENCES "MTRACForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_vehicleServicingId_fkey" FOREIGN KEY ("vehicleServicingId") REFERENCES "VehicleServicing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveMaintenanceCheckIn" ADD CONSTRAINT "PreventiveMaintenanceCheckIn_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "CheckIn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveMaintenanceCheckIn" ADD CONSTRAINT "CorrectiveMaintenanceCheckIn_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "CheckIn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualVehicleInspectionCheckIn" ADD CONSTRAINT "AnnualVehicleInspectionCheckIn_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "CheckIn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckOut" ADD CONSTRAINT "CheckOut_vehicleServicingId_fkey" FOREIGN KEY ("vehicleServicingId") REFERENCES "VehicleServicing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreventiveMaintenanceCheckOut" ADD CONSTRAINT "PreventiveMaintenanceCheckOut_checkOutId_fkey" FOREIGN KEY ("checkOutId") REFERENCES "CheckOut"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualVehicleInspectionCheckOut" ADD CONSTRAINT "AnnualVehicleInspectionCheckOut_checkOutID_fkey" FOREIGN KEY ("checkOutID") REFERENCES "CheckOut"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseClass" ADD CONSTRAINT "LicenseClass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MTRACForm" ADD CONSTRAINT "MTRACForm_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditor" ADD CONSTRAINT "Auditor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditor" ADD CONSTRAINT "Auditor_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceAdmin" ADD CONSTRAINT "MaintenanceAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolesToUser" ADD FOREIGN KEY ("A") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolesToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
