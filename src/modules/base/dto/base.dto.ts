import { Command } from '.prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateBaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  commandId: number;
}

export class UpdateBaseDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  id: number;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  commandId: number;
}

export class FindManyBasesQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  commandId: number;

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

export class TransferBaseDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  currentBaseId: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  newBaseId: number;
}