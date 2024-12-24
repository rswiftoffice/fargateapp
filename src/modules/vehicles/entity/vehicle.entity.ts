import { VehicleType } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class Vehicle {
  @ApiProperty()
  id: number;

  @ApiProperty()
  vehicleNumber: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  isServiceable: boolean;

  @ApiProperty({ enum: VehicleType })
  vehicleType: VehicleType;

  @ApiProperty()
  subUnitId?: number;

  @ApiProperty()
  vehiclesPlatformsId?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}


export class FindManyVehiclesResult {
  @ApiProperty({ type: [Vehicle]})
  records: Vehicle[]

  @ApiProperty()
  count: number
}
