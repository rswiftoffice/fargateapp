import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../core/auth/entity/loggedInUser.entity';
import { SubUnit } from '../../sub-units/entities/sub-unit.entity';


export class AuditorAdmin {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty()
  description: string

  @ApiProperty()
  deleted: boolean

  @ApiProperty()
  userId: number

  @ApiProperty()
  subUnitId: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class AuditorAdminWithRelatedData extends AuditorAdmin {
  @ApiProperty({ type: User})
  user: User

  @ApiProperty({ type: SubUnit})
  subUnit: SubUnit
}

export class FindManyAuditorAdminsResult {
  @ApiProperty()
  count: number

  @ApiProperty({ type: [AuditorAdminWithRelatedData]})
  records: AuditorAdminWithRelatedData[]
}

export class FindManyAuditorAdminsResultNoCount {
  @ApiProperty({ type: [AuditorAdminWithRelatedData]})
  records: AuditorAdminWithRelatedData[]
}
