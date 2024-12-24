import { Module } from '@nestjs/common';
import { SubUnitsService } from './sub-units.service';
import { SubUnitsController } from './sub-units.controller';

@Module({
  controllers: [SubUnitsController],
  providers: [SubUnitsService],
  exports: [SubUnitsService],
})
export class SubUnitsModule {}
