import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidDateString } from 'src/utils/isValidDateString.decorator';

export class DownloadPerformanceCardDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  verifiedBy: string;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: 'Date in ISO 8061 format',
  })
  @IsValidDateString()
  @IsNotEmpty()
  endDate: Date;
}
