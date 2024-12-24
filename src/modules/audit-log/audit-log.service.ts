import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { DatabaseService } from 'src/core/database/database.service';
import { buildFindingQueryInRange } from 'src/helpers/build';
import { ExportAuditLogsDto, FindManyAuditLogsDto } from './dto/audit-logs.dto';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(private database: DatabaseService) {}

  async create(createAuditBody: AuditLog) {
    const { addedBy, currentRole, description, name } = createAuditBody;

    await this.database.auditLog.create({
      data: {
        description,
        name,
        currentRole,
        addedBy: {
          connect: {
            id: addedBy,
          },
        },
      },
    });
  }

  async findMany(query: FindManyAuditLogsDto) {
    const { limit = 10, offset = 0, searchValue } = query;

    const findingQuery: any = {};

    if (searchValue) {
      findingQuery.OR = [
        { name: { contains: searchValue, mode: 'insensitive' } },
        { description: { contains: searchValue, mode: 'insensitive' } },
        {
          addedBy: {
            email: { contains: searchValue, mode: 'insensitive' },
          },
        },
      ];
    }

    const [count, auditLogs] = await Promise.all([
      this.database.auditLog.count({
        where: {
          deleted: false,
          ...findingQuery,
        },
      }),
      this.database.auditLog.findMany({
        where: {
          deleted: false,
          ...findingQuery,
        },
        take: limit,
        skip: offset,
        include: {
          addedBy: true,
        },
        orderBy: {
          id: 'asc',
        },
      }),
    ]);

    return {
      count,
      records: auditLogs,
    };
  }

  async getExportData(query: ExportAuditLogsDto) {
    const [records] = await Promise.all([
      this.database.auditLog.findMany({
        where: {
          createdAt: buildFindingQueryInRange(query.fromDate, query.toDate),
          deleted: false,
        },
        include: {
          addedBy: true,
        },
        orderBy: {
          id: 'asc',
        },
      }),
    ]);

    return {
      records: records,
    };
  }
}
