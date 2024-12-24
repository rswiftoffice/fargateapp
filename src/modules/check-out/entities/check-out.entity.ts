import { CheckInOutType } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CheckOut {
  @ApiProperty()
  id: number;

  @ApiProperty()
  dateOut: string;

  @ApiProperty()
  speedoReading: string;

  @ApiProperty()
  swdReading?: string;

  @ApiProperty()
  time: string;

  @ApiProperty()
  remark?: string;

  @ApiProperty()
  attendedBy: string;

  @ApiProperty()
  workCenter: string;

  @ApiProperty()
  vehicleTakenOver: string;

  @ApiProperty({ enum: CheckInOutType })
  checkOutType: CheckInOutType;
}

export class FindManyCheckOutsResult {
  @ApiProperty({ type: [CheckOut] })
  records: CheckOut[];

  @ApiProperty()
  count: number;
}

export class FindManyCheckOutsResultNoCount {
  @ApiProperty({ type: [CheckOut] })
  records: CheckOut[];
}
