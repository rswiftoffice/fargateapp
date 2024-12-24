import { ApiProperty } from '@nestjs/swagger'
import { LicenseClasses } from '../../license-classes/entities/license-classes.entity'

export class VehiclePlatform {
  @ApiProperty()
  id: number

  @ApiProperty()
  name: string

  @ApiProperty()
  licenseClassId: number | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class VehiclePlatformWithRelatedData extends VehiclePlatform {
  @ApiProperty({ type: LicenseClasses})
  licenseClass: LicenseClasses
}

export class FindManyVehiclePlatformsResult {
  @ApiProperty()
  count: number

  @ApiProperty({ type: [VehiclePlatformWithRelatedData]})
  records: VehiclePlatformWithRelatedData[]
}