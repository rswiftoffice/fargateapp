import { Module } from '@nestjs/common';
import { VehicleService } from './vehicles.service';
import { VechilesController } from './vehicles.controller';
import { VehiclesAdminController } from './vehicles.admin.controller';

@Module({
  controllers: [VechilesController, VehiclesAdminController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
