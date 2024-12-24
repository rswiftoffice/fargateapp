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
export class LicenseClassesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateLicenseClassDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  _class: string
}

export class UpdateLicenseClassDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  id: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  _class: string
}

export class FindManyLicenseClassesQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue: string

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

export class FindOneLicenseClassDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  id: number
}