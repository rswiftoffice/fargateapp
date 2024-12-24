import { Module } from '@nestjs/common';
import { BaseAdminsController } from './base-admin.controller';
import { BaseAdminService } from './base-admin.service';

@Module({
  imports: [],
  exports: [
    BaseAdminService,
  ],
  providers: [
    BaseAdminService,
  ],
  controllers: [
    BaseAdminsController
  ],
})
export class BaseAdminModule {}