import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateElogDTO } from 'src/modules/eLogs/dto/eLog.dto';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class StartDestinationDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  destinationId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  currentMeterReading: number;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  startTime: Date;
}

export class EndDestinationDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  destinationId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  currentMeterReading: number;

  @ApiProperty({
    required: true,
  })
  @IsOptional()
  @IsString()
  details: string;

  @ApiProperty()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateElogDTO)
  ELog: UpdateElogDTO;
}

export class AdHocDestinationDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  tripId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requisitionerPurpose: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  details: string;
}

export class UpdateOneDTO {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  to: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  tripDate: Date

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startTime: Date

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endTime: Date

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  meterReading: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalDistance: number;
}
