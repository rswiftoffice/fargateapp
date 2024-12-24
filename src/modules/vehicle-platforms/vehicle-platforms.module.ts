import { Module } from '@nestjs/common';
import { VehiclePlatformsController } from './vehicle-platforms.controller';
import { VehiclePlatformsService } from './vehicle-platforms.service';

@Module({
  exports: [VehiclePlatformsService],
  providers: [VehiclePlatformsService],
  controllers: [VehiclePlatformsController]
})

export class VehiclePlatformsModule { }