import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { IsValidDateString } from '../../../utils/isValidDateString.decorator';

export class FindOneBosAosPolDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  id: number;
}

export class FindManyBosAosPolDto {
  @ApiPropertyOptional({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  tripDate: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  driverName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  vehicleNumber: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue: string;

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

export class ExportBosAosPolDto {
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
}
