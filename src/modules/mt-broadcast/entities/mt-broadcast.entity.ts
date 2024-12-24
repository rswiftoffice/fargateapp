import { ApiProperty } from '@nestjs/swagger';

export class MtBroadcast {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  file: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}


export class FindManyMTBroadcastsResult {
  @ApiProperty({ type: [MtBroadcast]})
  records: MtBroadcast[]

  @ApiProperty()
  count: number
}
