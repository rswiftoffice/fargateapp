import { BasicIssueTools, CheckInOutType } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BasicIssueToolsDTO } from 'src/modules/check-in/dto/create-check-in.dto';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class PreventiveMaintenanceCheckOutDTO {
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  nextServicingDate: Date;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  nextServicingMileage: number;
}

export class AnnualVehicleInspectionCheckOutDTO {
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  nextAVIDate: Date;
}

export class CreateCheckOutDto {
  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  dateOut: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  speedoReading: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  swdReading?: string;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  time: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  attendedBy: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  workCenter: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicleTakenOver: string;

  @ApiProperty({
    description: 'checkOutType is enum of Preventive or AVI',
    enum: CheckInOutType,
  })
  @IsEnum(CheckInOutType, { each: true })
  @IsNotEmpty()
  checkOutType: CheckInOutType;

  @ApiProperty({
    minimum: 1,
    type: [BasicIssueToolsDTO],
  })
  @IsArray()
  basicIssueTools: BasicIssueTools[];

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => PreventiveMaintenanceCheckOutDTO)
  preventiveMaintenance: PreventiveMaintenanceCheckOutDTO;

  @ApiProperty()
  @IsOptional()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => AnnualVehicleInspectionCheckOutDTO)
  annualVehicleInspection: AnnualVehicleInspectionCheckOutDTO;

  @ApiProperty()
  @IsNotEmpty()
  vehicleServicing: number;
}
