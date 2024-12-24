import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class CreateUpdatesDto {
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  dateOfCompletion: Date;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  vehicleServicingId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  notes: string;
}
