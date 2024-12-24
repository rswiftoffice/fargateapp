import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEmail, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'

export class CreateBaseAdminDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  baseId: number
}

export class UpdateBaseAdminDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  userId: number

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  baseId: number
}

export class FindManyBaseAdminsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  searchValue: string

  @ApiPropertyOptional()
  @IsString()
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
  baseId: number

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

export class FindOneBaseAdminQueryDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  userId: number
}