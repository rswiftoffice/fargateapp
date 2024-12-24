import { FuelType, VehicleType } from '.prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateVehiclesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicleNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isServiceable: boolean;

  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType, { each: true })
  @IsNotEmpty()
  vehicleType: VehicleType;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  subUnitId: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  platformId: number;

}


export class UpdateVehicleDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  id: number;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  vehicleNumber: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  model: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  isServiceable: boolean;

  @ApiPropertyOptional({ enum: VehicleType })
  @IsEnum(VehicleType, { each: true })
  @IsNotEmpty()
  @IsOptional()
  vehicleType: VehicleType;

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  subUnitId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  platformId: number;
}

export class TransferVehicleDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  currentVehicleId: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  newVehicleId: number;
}

export class MakeVehicleAvailableDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  tripId: number

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  meterReading: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  details: string

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endTime: string

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  stationaryRunningTime: number

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  totalDistance: number

  @ApiPropertyOptional()
  @IsNumber()
  //@IsPositive()
  @IsOptional()
  fuelReceived: number

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  poSoNumber: number

  @ApiPropertyOptional({ enum: FuelType})
  @IsEnum(FuelType)
  @IsOptional()
  fuelType: FuelType

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  requisitionerPurpose: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  remarks: string

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endedAt: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasNoInProgressDestinations: boolean
}

export class FindManyVehiclesQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit: number

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  offset: number
}

export class FindOneVehicleDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  id: number;
}
