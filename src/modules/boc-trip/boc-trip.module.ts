import { Module } from '@nestjs/common';
import { BocTripController } from './boc-trip.controller';
import { BocTripService } from './boc-trip.service';

@Module({
  providers: [BocTripService],
  exports: [BocTripService],
  controllers: [BocTripController],
})
export class BocTripModule {}
