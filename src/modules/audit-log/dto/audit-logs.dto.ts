import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { IsValidDateString } from '../../../utils/isValidDateString.decorator'

export class FindManyAuditLogsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue?: string

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

export class ExportAuditLogsDto {
  @ApiPropertyOptional()
  @IsValidDateString()
  @IsOptional()
  @IsNotEmpty()
  fromDate: Date

  @ApiPropertyOptional()
  @IsValidDateString()
  @IsOptional()
  @IsNotEmpty()
  toDate: Date
}