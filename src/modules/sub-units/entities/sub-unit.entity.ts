import { ApiProperty } from '@nestjs/swagger';

export class SubUnit {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  base: string;

  @ApiProperty()
  drivers?: string;

  @ApiProperty()
  createdAt?: string;

  @ApiProperty()
  updatedAt?: string;
}

export class FindManySubUnitsResult {
  @ApiProperty()
  count: number

  @ApiProperty({ type: [SubUnit]})
  records: SubUnit[]
}
