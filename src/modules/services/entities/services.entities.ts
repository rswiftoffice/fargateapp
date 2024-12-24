import { ApiProperty } from '@nestjs/swagger'

export class Services {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty()
  description: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class FindManyServicesResult {
  @ApiProperty({ type: [Services]})
  records: Services[]

  @ApiProperty()
  count: number
}