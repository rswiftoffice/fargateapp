import { Module } from '@nestjs/common';
import { BosAosPolService } from './bos-aos-pol.service';
import { BosAosPolController } from './bos-aos-pol.controller';
import { VehicleModule } from '../vehicles/vehicles.modules';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [VehicleModule, AuditLogModule],
  controllers: [BosAosPolController],
  providers: [BosAosPolService],
  exports: [BosAosPolService],
})
export class BosAosPolModule {}
