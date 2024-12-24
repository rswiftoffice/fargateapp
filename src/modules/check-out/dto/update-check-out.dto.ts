import { CheckInOutType } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class UpdateCheckOutDto {
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  dateOut?: Date;

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
  time?: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  attendedBy?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  workCenter?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  vehicleTakenOver?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  checkOutType?: CheckInOutType;
}
