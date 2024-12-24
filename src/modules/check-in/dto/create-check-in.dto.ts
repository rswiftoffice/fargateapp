import { CheckInOutType, FrontSensorTag } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FileSystemStoredFile, IsFiles } from 'nestjs-form-data';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class BasicIssueToolsDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  quantity: number;
}

export class CorrectiveMaintenanceCheckInDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  correctiveMaintenance: string;
}

export class AnnualVehicleInspectionCheckInDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  defect: string;
}

export class PreventiveMaintenanceCheckInDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  defect: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class CreateCheckInDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  workCenter: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  telephoneNo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  speedoReading: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  swdReading?: string;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  dateIn: Date;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  expectedCheckoutDate: Date;

  @ApiProperty({
    type: 'number',
  })
  @IsNumberString({
    no_symbols: true,
  })
  @IsNotEmpty()
  vehicleId: number;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  expectedCheckoutTime: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  handedBy: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  attender: string;

  @ApiProperty({
    enum: FrontSensorTag,
  })
  @IsEnum(FrontSensorTag, { each: true })
  @IsNotEmpty()
  frontSensorTag: FrontSensorTag;

  @ApiProperty({
    type: String,
    enum: CheckInOutType,
  })
  @IsEnum(CheckInOutType, { each: true })
  @IsNotEmpty()
  checkInType: CheckInOutType;

  @ApiProperty({
    minimum: 1,
    type: BasicIssueToolsDTO,
    description:
      'basicIssueTools must be an array of object that contains name as string and quantity as number',
  })
  basicIssueTools: string;

  @ApiProperty({
    description:
      'This object should be passed when checkInType is set to Preventive!',
    required: false,
    type: PreventiveMaintenanceCheckInDTO,
  })
  preventiveMaintenance: string;

  @ApiProperty({
    description: 'This object should be passed when checkInType is set to AVI!',
    required: false,
    type: AnnualVehicleInspectionCheckInDTO,
  })
  annualVehicleInspection: string;

  @ApiProperty({
    description:
      'This object should be passed when checkInType is set to Corrective!',
    required: false,
    type: CorrectiveMaintenanceCheckInDTO,
  })
  correctiveMaintenance: string;

  @IsFiles()
  @IsOptional()
  @ApiProperty({
    type: 'file',
    format: 'binary',
    isArray: true,
    required: false,
    name: 'images[]',
  })
  images: FileSystemStoredFile[];
}
