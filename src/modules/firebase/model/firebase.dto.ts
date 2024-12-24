import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class TestFCMDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly deviceToken: string

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly title?: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly message: string
}
