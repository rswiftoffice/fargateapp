import { ApiProperty } from '@nestjs/swagger';

export class Elog {
  @ApiProperty()
  id: number;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  stationaryRunningTime: number;

  @ApiProperty()
  meterReading: number;

  @ApiProperty()
  totalDistance: number;

  @ApiProperty()
  fuelReceived: number;

  @ApiProperty()
  deleted: boolean;

  @ApiProperty()
  fuelType: string;

  @ApiProperty()
  remarks: string;

  @ApiProperty()
  POSONumber: number;

  @ApiProperty()
  requisitionerPurpose: null | string;

  @ApiProperty()
  destinationId: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class FindManyELogsResult {
  @ApiProperty({ type: [Elog]})
  records: Elog[]

  @ApiProperty()
  count: number
}
