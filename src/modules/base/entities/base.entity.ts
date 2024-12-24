import { ApiProperty } from '@nestjs/swagger';
import { Commands } from '../../commands/entities/commands.entities';
export class Base {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  subUnit?: string;

  @ApiProperty()
  macs?: string;
}

export class BaseWithRelationData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  command: Commands

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}


export class FindManyBasesResult {
  @ApiProperty()
  count: number

  @ApiProperty({ type: [BaseWithRelationData]})
  records: BaseWithRelationData[]
}
