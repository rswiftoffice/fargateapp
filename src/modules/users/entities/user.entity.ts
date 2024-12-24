import { ApiProperty } from '@nestjs/swagger';

export class RequestedUser {
  id: number;
  name: string;
  email: string;
  username: string;
  subUnitId: number;
  subUnit: any;
  adminSubUnitId: number;
  serviceId?: number;
  commandId?: number;
  baseAdminId?: number;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  hasBaseLevelVehiclesAccess: boolean;
}

export class UserListResults {
  @ApiProperty()
  count: number;

  @ApiProperty({ type: [RequestedUser] })
  records: RequestedUser[];
}
