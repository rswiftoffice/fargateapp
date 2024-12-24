import { Module } from '@nestjs/common';
import { CheckOutService } from './check-out.service';
import { CheckOutController } from './check-out.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [CheckOutController],
  providers: [CheckOutService],
  exports: [CheckOutService],
})
export class CheckOutModule {}
