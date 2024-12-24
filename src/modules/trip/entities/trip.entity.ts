import { TripApprovalStatus, TripStatus } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class Trip {
  @ApiProperty()
  id: number;

  @ApiProperty()
  tripDate: string;

  @ApiProperty()
  approvalStatus: TripApprovalStatus;

  @ApiProperty()
  currentMeterReading?: number;

  @ApiProperty()
  tripStatus: TripStatus;

  @ApiProperty()
  endedAt: Date;

  @ApiProperty()
  aviDate: Date;

  @ApiProperty()
  driverId: number;

  @ApiProperty()
  vehiclesId: number;

  @ApiProperty()
  approvingOfficerId?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
