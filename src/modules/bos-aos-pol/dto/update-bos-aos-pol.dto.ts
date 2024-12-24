import { ApiProperty } from '@nestjs/swagger';
import { FuelType } from '@prisma/client';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class UpdateBosAosPolDto {
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  tripDate: Date;

  @ApiProperty()
  id: number;

  @ApiProperty()
  meterReading: number;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  fuelRecieved: number;

  @ApiProperty()
  fuelType: FuelType;
}
