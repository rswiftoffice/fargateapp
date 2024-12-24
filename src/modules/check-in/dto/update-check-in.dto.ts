import { CheckInOutType, FrontSensorTag } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class UpdateCheckInDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  workCenter?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  telephoneNo?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  speedoReading?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  swdReading?: string;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  dateIn?: string;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  expectedCheckoutDate?: string;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  expectedCheckoutTime?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  handedBy?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  attender?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  checkInType?: CheckInOutType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  frontSensorTag?: FrontSensorTag;
}
