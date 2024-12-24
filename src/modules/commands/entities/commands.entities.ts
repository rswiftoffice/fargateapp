import { ApiProperty } from '@nestjs/swagger'
import { Services } from '../../services/entities/services.entities'

export class Commands {
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

  @ApiProperty()
  serviceId: number
}

export class CommandWithRelatedService {
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

  @ApiProperty()
  service: Services
}

export class FindManyCommandsResult {
  @ApiProperty()
  count: number

  @ApiProperty({ type: [CommandWithRelatedService]})
  records: CommandWithRelatedService[]
}