import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Transform, Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsPositive, IsString } from "class-validator"

export class CreateCommandDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty()
  @IsNumber()
  serviceId: number
}

export class UpdateCommandDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string
}

export class FindManyCommandsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue?: string

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  serviceId?: number

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

export class TransferCommandDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  currentCommandId: number

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  newCommandId: number
}