import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsInt, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateSubUnitAdminDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsInt()
  @IsPositive()
  subUnitId: number
}

export class UpdateSubUnitAdminDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  userId: number

  @ApiProperty()
  @IsInt()
  @IsPositive()
  subUnitId: number
}

export class FindManySubUnitAdminsQuery {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue: string

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  subUnitId: number

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit: number

  @ApiPropertyOptional()
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  offset: number
}

export class FindOneSubUnitAdminQueryDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  userId: number
}