import { Command } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  subUnits: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  macs: string;

  @ApiProperty()
  @IsNotEmpty()
  command: Command;
}
