import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'

export class CreateServiceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsString()
  description: string
}

export class UpdateServiceDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  id: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string
}

export class FindManyServicesDto {
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

export class TransferServiceDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  currentServiceId: number

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  newServiceId: number
}

export class IdentityDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  id: number
}