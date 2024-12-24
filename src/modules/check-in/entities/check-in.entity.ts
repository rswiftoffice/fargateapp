import { CheckInOutType, FrontSensorTag } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CheckIn {
  @ApiProperty()
  id: number;

  @ApiProperty()
  workCenter: string;

  @ApiProperty()
  telephoneNo: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  dateIn: string;

  @ApiProperty()
  speedoReading: string;

  @ApiProperty()
  swdReading: string;

  @ApiProperty()
  expectedCheckoutDate: string;

  @ApiProperty()
  expectedCheckoutTime: string;

  @ApiProperty()
  handedBy: string;

  @ApiProperty()
  attender: string;

  @ApiProperty({ enum: CheckInOutType })
  checkInType: CheckInOutType;

  @ApiProperty({ enum: FrontSensorTag })
  frontSensorTag: FrontSensorTag;

  @ApiProperty()
  vehicleServicingId?: number;
}

export class FindManyCheckInsResult {
  @ApiProperty({ type: [CheckIn] })
  records: CheckIn[];

  @ApiProperty()
  count: number;
}

export class FindManyCheckInsResultNoCount {
  @ApiProperty({ type: [CheckIn] })
  records: CheckIn[];
}
