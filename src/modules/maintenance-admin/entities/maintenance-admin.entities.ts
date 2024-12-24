import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../core/auth/entity/loggedInUser.entity';
import { Base } from '../../base/entities/base.entity';

export class MaintenanceAdmin {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty()
  description: string

  @ApiProperty()
  baseId: number

  @ApiProperty()
  userId: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiProperty({ type: User })
  user: User
}

export class MaintenanceAdminWithRelatedDate extends MaintenanceAdmin {
  @ApiProperty({ type: Base})
  base: Base
}

export class FindManyMaintenanceAdminsResult {
  @ApiProperty({ type: [MaintenanceAdminWithRelatedDate]})
  records: MaintenanceAdminWithRelatedDate[]

  @ApiProperty()
  count: number
}