import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEmail, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'

export class CreateServiceAdminDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  serviceId: number
}

export class UpdateServiceAdminDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  userId: number

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  serviceId: number
}

export class FindOneServiceAdminQueryDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  userId: number
}

export class GetServiceAdminsQueryDto {
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
  serviceId: number

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
