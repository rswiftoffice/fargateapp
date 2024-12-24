import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDestinationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requisitionerPurpose: string;
}

export class FindManyDestinationDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue?: string

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  offset?: number

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  tripDate?: Date
}
