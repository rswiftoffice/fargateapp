import { Module } from '@nestjs/common';
import { MaintenanceAdminsController } from './maintenance-admin.controller';
import { MaintenanceAdminService } from './maintenance-admin.service';

@Module({
  exports: [MaintenanceAdminService],
  providers: [MaintenanceAdminService],
  controllers: [MaintenanceAdminsController]
})

export class MaintenanceAdminModule {}