import { Module } from '@nestjs/common';
import { AuditorAdminController } from './auditor-admins.controller';
import { AuditorAdminsService } from './auditor-admins.service';

@Module({
  imports: [],
  exports: [AuditorAdminsService],
  providers: [AuditorAdminsService],
  controllers: [AuditorAdminController]
})

export class AuditorAdminModule { }