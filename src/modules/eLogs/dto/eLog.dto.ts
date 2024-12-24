import { FuelType } from '.prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class UpdateElogDTO {
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  stationaryRunningTime: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  totalDistance: number;

  @ApiProperty({
    required: false,
  })
  
  @IsOptional()
  fuelReceived: number;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
  POSONumber: number;

  @ApiProperty({
    name: 'fuelType',
    enum: FuelType,
    required: false,
  })
  @IsEnum(FuelType, { each: true })
  @IsOptional()
  fuelType: FuelType;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  requisitionerPurpose: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  remarks: string;
}

export class CreatElogForBOSDTO {
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  stationaryRunningTime: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  totalDistance: number;

  @ApiProperty({
    required: false,
  })
  
  @IsOptional()
  fuelReceived: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber() 
  @IsNotEmpty()
  POSONumber: number;

  @ApiProperty({
    required: true,
    enum: FuelType,
  })
  @IsOptional()
  @IsEnum(FuelType, { each: true })
  fuelType: FuelType;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  requisitionerPurpose: string;
  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
  remarks: string;
}

export class FindManyELogsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue?: string

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

export class ExportELogsDto {
  @ApiPropertyOptional()
  @IsValidDateString()
  @IsOptional()
  @IsNotEmpty()
  fromDate: Date

  @ApiPropertyOptional()
  @IsValidDateString()
  @IsOptional()
  @IsNotEmpty()
  toDate: Date
}
