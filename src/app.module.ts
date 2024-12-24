import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './core/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { VehicleModule } from './modules/vehicles/vehicles.modules';
import { TripModule } from './modules/trip/trip.module';
import { ELogModule } from './modules/eLogs/eLog.module';
import { BosAosPolModule } from './modules/bos-aos-pol/bos-aos-pol.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { CheckInModule } from './modules/check-in/check-in.module';
import { CheckOutModule } from './modules/check-out/check-out.module';
import { PerformanceCardModule } from './modules/performance-card/performance-card.module';
import { VehicleServicingModule } from './modules/vehicle-servicing/vehicle-servicing.module';
import { UploadModule } from './modules/upload/upload.module';
import { MtBroadcastModule } from './modules/mt-broadcast/mt-broadcast.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { FilteredResponseInterceptor } from './core/interceptors/filtered-response.interceptor';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { ServicesModule } from './modules/services/services.module';
import { CommandsModule } from './modules/commands/commands.module';
import { CommandAdminsModule } from './modules/command-admins/command-admins.module';
import { BaseModule } from './modules/base/base.module';
import { SubUnitsModule } from './modules/sub-units/sub-units.module';
import { LicenseClassesModule } from './modules/license-classes/license-classes.module';
import { ServiceAdminsModule } from './modules/service-admins/service-admins.module';
import { BaseAdminModule } from './modules/base-admin/base-admin.module';
import { SubUnitAdminsModule } from './modules/sub-unit-admin/sub-unit-admin.module';
import { AuditorAdminModule } from './modules/auditor-admins/auditor-admins.module';
import { VehiclePlatformsModule } from './modules/vehicle-platforms/vehicle-platforms.module';
import { MaintenanceAdminModule } from './modules/maintenance-admin/maintenance-admin.module';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { MTRACFormModule } from './modules/mtrac-form/mtrac-form.module';
import { DriverMileageModule } from './modules/driver-mileage/driver-mileage.module';
import { ElogBookModule } from './modules/elog-book/elog-book.module';
import { BocTripModule } from './modules/boc-trip/boc-trip.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    VehicleModule,
    AuthModule,
    TripModule,
    ELogModule,
    BosAosPolModule,
    AuditLogModule,
    CheckInModule,
    CheckOutModule,
    PerformanceCardModule,
    VehicleServicingModule,
    MtBroadcastModule,
    UploadModule,
    FirebaseModule,
    ServicesModule,
    ServiceAdminsModule,
    CommandsModule,
    CommandAdminsModule,
    BaseModule,
    BaseAdminModule,
    SubUnitsModule,
    SubUnitAdminsModule,
    LicenseClassesModule,
    AuditorAdminModule,
    MaintenanceAdminModule,
    VehiclePlatformsModule,
    DestinationsModule,
    AuditLogModule,
    MTRACFormModule,
    DriverMileageModule,
    ElogBookModule,
    BocTripModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: FilteredResponseInterceptor,
    },
  ],
})
export class AppModule {}
