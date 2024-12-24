import { Module } from '@nestjs/common';
import { MtBroadcastService } from './mt-broadcast.service';
import { MtBroadcastController } from './mt-broadcast.controller';
import { FileSystemStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    AuditLogModule,
    NestjsFormDataModule.config({
      fileSystemStoragePath: './uploads',
      storage: FileSystemStoredFile,
      autoDeleteFile: false,
    }),
  ],
  controllers: [MtBroadcastController],
  providers: [MtBroadcastService],
  exports: [MtBroadcastService],
})
export class MtBroadcastModule {}
