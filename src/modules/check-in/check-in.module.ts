import { Module } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { CheckInController } from './check-in.controller';
import { VehicleModule } from '../vehicles/vehicles.modules';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { FileSystemStoredFile, NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [
    VehicleModule,
    AuditLogModule,
    NestjsFormDataModule.config({
      fileSystemStoragePath: './uploads',
      storage: FileSystemStoredFile,
      autoDeleteFile: false,
    }),
  ],
  controllers: [CheckInController],
  providers: [CheckInService],
  exports: [CheckInService],
})
export class CheckInModule {}
