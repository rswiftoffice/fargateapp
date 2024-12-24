import { Module } from '@nestjs/common';
import { LicenseClassesService } from './license-classes.service';
import { LicenseClassesController } from './license-classes.controller';

@Module({
  controllers: [LicenseClassesController],
  providers: [LicenseClassesService],
  exports: [LicenseClassesService],
})
export class LicenseClassesModule {}
