import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateMtBroadcastDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  file: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  userId: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  subUnitId: number;
}
