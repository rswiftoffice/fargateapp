import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator"

export class FindManyMTBroadcastsDto {
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

export class FindOneMTBroadcastDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  id: number
}