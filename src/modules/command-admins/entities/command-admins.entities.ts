import { ApiProperty } from '@nestjs/swagger'
import { CommandWithRelatedService } from '../../commands/entities/commands.entities'
import { User } from '../../../core/auth/entity/loggedInUser.entity'

export class CommandAdminWithRelatedData extends User {
  @ApiProperty()
  command: CommandWithRelatedService
}

export class FindManyCommandAdminsResult {
  @ApiProperty()
  count: number

  @ApiProperty({ type: [CommandAdminWithRelatedData]})
  records: CommandAdminWithRelatedData[]
}