import { ApiProperty } from '@nestjs/swagger';

export class LicenseClasses {
  @ApiProperty()
  id: number;

  @ApiProperty()
  class: string;

  @ApiProperty()
  createdAt?: string;

  @ApiProperty()
  updatedAt?: string;
}

export class FindManyLicenseClassesResult {
  @ApiProperty({ type: [LicenseClasses]})
  records: LicenseClasses[]

  @ApiProperty()
  count: number
}