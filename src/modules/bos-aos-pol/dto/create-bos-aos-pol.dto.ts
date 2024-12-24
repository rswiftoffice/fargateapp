import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatElogForBOSDTO } from 'src/modules/eLogs/dto/eLog.dto';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class CreateBosAosPolDto {
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  tripDate: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requisitionerPurpose: string;

  @ApiProperty()
  @IsNotEmpty()
  currentMeterReading: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  vehicleId: number;

  @ApiProperty()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => CreatElogForBOSDTO)
  eLog: CreatElogForBOSDTO;
}
