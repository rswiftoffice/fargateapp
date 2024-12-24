import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubscribeTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly token: string;
}

export class FindUsersDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue: string

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

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    type: String,
    default: 'ADMIN,COMMAND',
  })
  @IsArray()
  @IsOptional()
  @IsNotEmpty()
  roles?: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  subUnitId?: number;

  @ApiPropertyOptional({
    type: [Number],
  })
  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  licenseClasses?: number[];

  @ApiPropertyOptional({
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  hasBaseLevelVehiclesAccess?: boolean;
}

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: String,
    default: 'ADMIN,COMMAND',
  })
  @IsArray()
  @IsNotEmpty()
  roles: string[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  subUnitId: number;

  @ApiProperty({
    type: [Number],
  })
  @IsArray()
  @IsOptional()
  @IsNumber({ }, { each: true })
  licenseClasses: number[];

  @ApiProperty({
    type: Boolean,
  })
  @IsBoolean()
  @IsNotEmpty()
  hasBaseLevelVehiclesAccess: boolean;
}
