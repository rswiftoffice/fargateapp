import { FilledBy } from '.prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuizzesDTO } from 'src/modules/quizzes/dto/quizzes-dto';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class CreateMTRACFormDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  overAllRisk: string;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  dispatchDate: Date;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  dispatchTime: Date;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  releaseDate: Date;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsOptional()
  releaseTime: Date;

  @ApiProperty({
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isAdditionalDetailApplicable: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  rankAndName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  personalPin: string;

  @ApiProperty({
    enum: FilledBy,
  })
  @IsOptional()
  @IsEnum(FilledBy, { each: true })
  filledBy: FilledBy;

  @ApiProperty({
    isArray: true,
    type: 'string',
  })
  @IsArray()
  @IsOptional()
  otherRiskAssessmentChecklist: string[];

  @ApiProperty({
    isArray: true,
    type: 'string',
  })
  @IsArray()
  @IsOptional()
  driverRiskAssessmentChecklist: string[];

  @ApiProperty({
    isArray: true,
    type: QuizzesDTO,
  })
  @IsDefined()
  @IsArray()
  @ValidateNested()
  @Type(() => QuizzesDTO)
  quizzes: QuizzesDTO[];
}

export class FindManyMTRACFormDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  approvalStatus?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  driverName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  despatchDate?: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  releaseDate?: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tripDateRange?: {
    startDate: Date;
    endDate: Date;
  };

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  offset: number;
}

export class ExportMTRACFormDto {
  @ApiPropertyOptional()
  @IsValidDateString()
  @IsOptional()
  @IsNotEmpty()
  fromDate: Date;

  @ApiPropertyOptional()
  @IsValidDateString()
  @IsOptional()
  @IsNotEmpty()
  toDate: Date;

  @IsOptional()
  @IsNotEmpty()
  currentRole: string;

  @IsOptional()
  @IsNotEmpty()
  serviceId: number;

  @IsOptional()
  @IsNotEmpty()
  commandId: number;

  @IsOptional()
  @IsNotEmpty()
  baseAdminId: number;

  @IsOptional()
  @IsNotEmpty()
  adminSubUnitId: number;

  @IsOptional()
  @IsNotEmpty()
  subUnitId: number;
}
