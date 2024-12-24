import {
  ApprovalStatus,
  DestinationStatus,
  ELog,
  Trip,
  User,
} from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class Destination {
  @ApiProperty()
  id: number;

  @ApiProperty()
  to: string;

  @ApiProperty()
  requisitionerPurpose: string;

  @ApiProperty()
  details?: string;

  @ApiProperty()
  status: DestinationStatus;

  @ApiProperty()
  currentMeterReading?: number;

  @ApiProperty()
  isAdHocDestination: boolean;

  @ApiProperty()
  trip: Trip;

  @ApiProperty()
  eLog: ELog;

  @ApiProperty()
  approvingOfficer: User;

  @ApiProperty()
  approvalStatus: ApprovalStatus;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
