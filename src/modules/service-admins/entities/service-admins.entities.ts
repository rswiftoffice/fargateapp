import { ApiProperty } from '@nestjs/swagger'
import { User } from '../../../core/auth/entity/loggedInUser.entity'
import { Services } from '../../services/entities/services.entities'

export class ServiceAdminWithRelatedData extends User {
  @ApiProperty()
  service: Services
}

export class FindManyServiceAdminsResult {
  @ApiProperty()
  count: number

  @ApiProperty({ type: [ServiceAdminWithRelatedData]})
  records: ServiceAdminWithRelatedData[]
}