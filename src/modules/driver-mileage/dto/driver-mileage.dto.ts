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

export class FindManyDriverMileagesDto {
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

export class ExportDriverMileagesDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  driverId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  verifiedBy: string;

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
