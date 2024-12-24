import { TripApprovalStatus, TripStatus } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class UpdateTripDto {
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  tripDate?: Date;

  @ApiProperty({
    enum: TripStatus,
  })
  @IsEnum(TripStatus, { each: true })
  @IsOptional()
  status?: TripStatus;

  @ApiProperty()
  @IsEnum(TripApprovalStatus, { each: true })
  @IsOptional()
  approvalStatus?: TripApprovalStatus;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  currentMeterReading?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  tripId: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isTripStarted?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isTripCompleted?: boolean;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  endedAt?: Date;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  aviDate?: Date;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  driverId?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  vehiclesId?: number;
}

export class UpdateTripApprovedDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  tripId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  safetyMeasures: string;
}
