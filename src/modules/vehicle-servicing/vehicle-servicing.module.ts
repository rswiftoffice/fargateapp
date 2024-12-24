import { Module } from '@nestjs/common';
import { VehicleServicingService } from './vehicle-servicing.service';
import { VehicleServicingController } from './vehicle-servicing.controller';

@Module({
  controllers: [VehicleServicingController],
  providers: [VehicleServicingService]
})
export class VehicleServicingModule {}
