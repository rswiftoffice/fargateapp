import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsValidDateString } from '../../../utils/isValidDateString.decorator';

export class FindManyBocTripDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  driverName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tripDate?: Date;

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  offset: number;


  @IsOptional()
  @IsNotEmpty()
  currentRole: string;

  @IsOptional()
  @IsNotEmpty()
  serviceId: number;

  @IsOptional()
  @IsNotEmpty()
  commandId: number;

  @IsOptional()
  @IsNotEmpty()
  baseAdminId: number;

  @IsOptional()
  @IsNotEmpty()
  adminSubUnitId: number;

  @IsOptional()
  @IsNotEmpty()
  subUnitId: number;
}

export class ExportBocTripDto {
  @ApiPropertyOptional()
  @IsValidDateString()
  @IsOptional()
  @IsNotEmpty()
  fromDate: Date;

  @ApiPropertyOptional()
  @IsValidDateString()
  @IsOptional()
  @IsNotEmpty()
  toDate: Date;

  @IsOptional()
  @IsNotEmpty()
  currentRole: string;

  @IsOptional()
  @IsNotEmpty()
  serviceId: number;

  @IsOptional()
  @IsNotEmpty()
  commandId: number;

  @IsOptional()
  @IsNotEmpty()
  baseAdminId: number;

  @IsOptional()
  @IsNotEmpty()
  adminSubUnitId: number;

  @IsOptional()
  @IsNotEmpty()
  subUnitId: number;
}
