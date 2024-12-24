import { ApiProperty } from '@nestjs/swagger';

export class VehicleLastMeterReading {
  @ApiProperty({
    nullable: true,
    type: Number,
    default: null,
  })
  meterReading: number | null;
}
