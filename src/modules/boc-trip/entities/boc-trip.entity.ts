import { Role } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AuditLog {
  name: string;
  description: string;
  currentRole: Role;
  addedBy: number;
}


export class FindManyAuditLogsResult {
  @ApiProperty()
  count: number

  @ApiProperty({ type: [AuditLog]})
  records: AuditLog[]
}
