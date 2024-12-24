import { ApiProperty } from '@nestjs/swagger';

export class BosAosPol {
  @ApiProperty()
  id: number;

  @ApiProperty()
  tripDate: string;

  @ApiProperty()
  meterReading: number;

  @ApiProperty()
  startTime?: string;

  @ApiProperty()
  endTime?: string;

  @ApiProperty()
  fuelRecieved: number;

  @ApiProperty()
  fuelType: number;
}

export class FindManyBosAosPolResult {
  @ApiProperty({ type: [BosAosPol]})
  records: BosAosPol[]

  @ApiProperty()
  count: number
}
