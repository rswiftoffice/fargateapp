ALTER TABLE "BOCTrip" ALTER COLUMN "currentMeterReading" TYPE NUMERIC(10,2);

ALTER TABLE "ELog" ALTER COLUMN "meterReading" TYPE NUMERIC(10,2);

ALTER TABLE "ELog" ALTER COLUMN "totalDistance" TYPE NUMERIC(10,2);

ALTER TABLE "ELog" ALTER COLUMN "fuelReceived" TYPE NUMERIC(10,2);