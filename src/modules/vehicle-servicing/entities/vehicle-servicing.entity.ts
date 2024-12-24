import { Vehicle } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class VehicleServicing {
  @ApiProperty()
  id: number;

  @ApiProperty()
  maintenanceType: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  vehicleId: number;

  @ApiProperty()
  vehicle: Vehicle;
}

export class FindManyVehicleServicingResult {
  @ApiProperty({ type: [VehicleServicing] })
  records: VehicleServicing[];

  @ApiProperty()
  count: number;
}

export class FindManyVehicleServicingResultNoCount {
  @ApiProperty({ type: [VehicleServicing] })
  records: VehicleServicing[];
}
