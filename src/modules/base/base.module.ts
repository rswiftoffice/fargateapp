import { Module } from '@nestjs/common';
import { BaseService } from './base.service';
import { BaseController } from './base.controller';

@Module({
  controllers: [BaseController],
  providers: [BaseService],
  exports: [BaseService],
})
export class BaseModule {}
