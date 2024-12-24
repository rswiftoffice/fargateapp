import { Module } from '@nestjs/common';
import { MTRACFormController } from './mtrac-form.controller';
import { MTRACFormService } from './mtrac-form.service';

@Module({
  exports: [MTRACFormService],
  providers: [MTRACFormService],
  controllers: [MTRACFormController]
})

export class MTRACFormModule { }