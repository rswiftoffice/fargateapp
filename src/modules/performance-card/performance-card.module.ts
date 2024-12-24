import { Module } from '@nestjs/common';
import { PerformanceCardController } from './performance-card.controller';
import { PerformanceCardService } from './performance-card.service';

@Module({
  controllers: [PerformanceCardController],
  providers: [PerformanceCardService],
  exports: [PerformanceCardService],
})
export class PerformanceCardModule {}
