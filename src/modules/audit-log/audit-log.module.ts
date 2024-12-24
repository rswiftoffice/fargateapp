import { Module } from '@nestjs/common';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';

@Module({
  providers: [AuditLogService],
  exports: [AuditLogService],
  controllers: [AuditLogController]
})
export class AuditLogModule {}
