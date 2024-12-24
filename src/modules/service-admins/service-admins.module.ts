import { Module } from '@nestjs/common';
import { ServiceAdminsController } from './service-admins.controller';
import { ServiceAdminsService } from './service-admins.service';

@Module({
  imports: [],
  exports: [
    ServiceAdminsService,
  ],
  providers: [
    ServiceAdminsService,
  ],
  controllers: [
    ServiceAdminsController,
  ]
})
export class ServiceAdminsModule {}
