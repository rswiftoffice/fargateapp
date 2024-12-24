import { Role } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../core/auth/entity/loggedInUser.entity';
import { LicenseClasses } from '../../license-classes/entities/license-classes.entity';
import { SubUnit } from '../../sub-units/entities/sub-unit.entity';

export class DriverMileage extends User {
  @ApiProperty({ type: SubUnit })
  subUnit: SubUnit;

  @ApiProperty()
  roles;

  @ApiProperty({ type: [LicenseClasses] })
  licenseClasses: LicenseClasses[];
}

export class FindManyDriverMileagesResult {
  @ApiProperty({ type: [DriverMileage] })
  records: DriverMileage[];

  @ApiProperty()
  count: number;
}

export class FindManyDriverMileagesResultNoCount {
  @ApiProperty({ type: [DriverMileage] })
  records: DriverMileage[];
}
