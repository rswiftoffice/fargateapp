import { Module } from '@nestjs/common';
import { ELogService } from './eLog.service';
import { ELogController } from './eLog.controller';

@Module({
  controllers: [ELogController],
  providers: [ELogService],
  exports: [ELogService],
})
export class ELogModule {}
