import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class QuizzesDTO {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  answer: string;
}
