import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { CreateDestinationDto } from 'src/modules/destinations/dto/destination.dto';
import { CreateMTRACFormDto } from 'src/modules/mtrac-form/dto/mtrac-form.dto';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class CreateTripDto {
  @ApiProperty({
    required: true,
  })
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  tripDate: Date;

  @ApiProperty({
    required: true,
  })
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  aviDate: Date;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  vehicle: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsNotEmpty()
  currentMeterReading: number;

  @ApiProperty({
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isTripFromPreApprovedDriver: boolean;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  approvingOfficer: number;

  @ApiProperty({
    minimum: 1,
    type: CreateDestinationDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested()
  @Type(() => CreateDestinationDto)
  destinations: CreateDestinationDto[];

  @ApiProperty({
    type: CreateMTRACFormDto,
  })
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateMTRACFormDto)
  MTRACForm: CreateMTRACFormDto;
}

export class CreateTripWithoutMTRACFormDto {
  @ApiProperty({
    required: true,
  })
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  tripDate: Date;

  @ApiProperty({
    required: true,
  })
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  aviDate: Date;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  vehicle: number;

  @ApiProperty({
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isTripFromPreApprovedDriver: boolean;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  approvingOfficer: number;

  @ApiProperty({
    minimum: 1,
    type: CreateDestinationDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested()
  @Type(() => CreateDestinationDto)
  destinations: CreateDestinationDto[];
}
