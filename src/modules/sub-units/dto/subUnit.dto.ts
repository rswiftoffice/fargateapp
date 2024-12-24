import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
export class CreateSubUnitDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  baseId: number;
}

export class UpdateSubUnitDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description: string

  @ApiPropertyOptional()
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  baseId: number
}

export class FindManySubUnitsQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  baseId: number;

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

export class TransferSubUnitDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  currentSubUnitId: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  newSubUnitId: number;
}
