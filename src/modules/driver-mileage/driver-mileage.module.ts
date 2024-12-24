import { Module } from "@nestjs/common";
import { DriverMileageController } from "./driver-mileage.controller";
import { DriverMileageService } from "./driver-mileage.service";

@Module({
  exports: [DriverMileageService],
  providers: [DriverMileageService],
  controllers: [DriverMileageController]
})

export class DriverMileageModule {}