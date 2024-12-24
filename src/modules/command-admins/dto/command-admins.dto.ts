import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsEmail, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"

export class CreateCommandAdminDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  commandId: number
}

export class UpdateCommandAdminDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  userId: number

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  commandId: number
}

export class GetListCommandAdminsQueryDto {
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

  @ApiPropertyOptional()
  @IsString()
  @Type(() => String)
  @IsOptional()
  searchValue: string
}