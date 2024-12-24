import { ApiProperty } from '@nestjs/swagger'
import { SubUnit } from '../../sub-units/entities/sub-unit.entity'
import { User } from '../../../core/auth/entity/loggedInUser.entity'

export class SubUnitAdminWithRelatedData extends User {
  @ApiProperty()
  adminSubUnit: SubUnit
}

export class FindManySubUnitAdminsResult {
  @ApiProperty()
  count: number

  @ApiProperty({ type: [SubUnitAdminWithRelatedData]})
  records: SubUnitAdminWithRelatedData[]
}