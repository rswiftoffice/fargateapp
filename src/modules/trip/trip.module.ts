import { Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { UsersModule } from '../users/users.module';
import { VehicleModule } from '../vehicles/vehicles.modules';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    UsersModule,
    VehicleModule,
    AuditLogModule,
    FirebaseModule,
  ],
  controllers: [TripController],
  providers: [TripService],
  exports: [TripService],
})
export class TripModule {}
