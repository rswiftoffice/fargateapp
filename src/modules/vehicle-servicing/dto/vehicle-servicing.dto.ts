import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsValidDateString } from '../../../utils/isValidDateString.decorator';

export class FindManyVehicleServicesDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  maintenanceType: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  maintenanceStatus: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tripDate: Date;

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
}

export class ExportVehicleServicingDto {
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

  @IsOptional()
  @IsNotEmpty()
  baseId: number;
}
