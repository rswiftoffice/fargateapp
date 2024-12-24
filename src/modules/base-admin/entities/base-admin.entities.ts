import { ApiProperty } from '@nestjs/swagger'
import { Base } from '../../base/entities/base.entity'
import { User } from '../../../core/auth/entity/loggedInUser.entity'

export class BaseAdminWithRelatedData extends User {
  @ApiProperty()
  base: Base
}

export class FindManyBaseAdminsResult {
  @ApiProperty()
  count: number

  @ApiProperty({ type: [BaseAdminWithRelatedData]})
  records: BaseAdminWithRelatedData[]
}