import { Module } from '@nestjs/common';
import { SubUnitAdminsController } from './sub-unit-admin.controller';
import { SubUnitAdminsService } from './sub-unit-admin.service';

@Module({
  imports: [],
  exports: [SubUnitAdminsService],
  providers: [SubUnitAdminsService],
  controllers: [SubUnitAdminsController]
})
export class SubUnitAdminsModule {}
