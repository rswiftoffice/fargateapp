import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestedUser } from '../users/entities/user.entity';
import { CreateMtBroadcastDto } from './dto/create-mt-broadcast.dto';
import { Request } from 'express';
import * as moment from 'moment';
import { DatabaseService } from 'src/core/database/database.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Role } from '.prisma/client';
import { ConfigService } from '@nestjs/config';
import { FindManyMTBroadcastsDto } from './dto/mt-broardcast.dto';

@Injectable()
export class MtBroadcastService {
  constructor(
    private database: DatabaseService,
    private auditLogService: AuditLogService,
    private config: ConfigService,
  ) {}

  async create(data: CreateMtBroadcastDto) {

    if (data.userId) {
      const user = await this.database.user.findFirst({
        where: {
          id: data.userId,
          deleted: false,
        }
      })

      if (!user) {
        throw new BadRequestException(`User not found with id: ${data.userId}`)
      }
    }

    if (data.subUnitId) {
      const subUnit = await this.database.subUnit.findFirst({
        where: {
          id: data.subUnitId,
          deleted: false,
        }
      })

      if (!subUnit) {
        throw new BadRequestException(`Sub unit not found with id: ${data.subUnitId}`)
      }
    }

    const mtb = await this.database.mTBroadcast.create({
      data: {
        title: data.title,
        file: data.file,
        userId: data.userId,
        subUnitId: data.subUnitId,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return mtb
  }

  async delete(id: number) {
    const mtb = await this.database.mTBroadcast.findFirst({
      where: {
        id,
        deleted: false,
      }
    })

    if (!mtb) {
      throw new BadRequestException(`MT Broadcast not found with id: ${id}`)
    }

    const deletedBroadcast = await this.database.mTBroadcast.update({
      where: {
        id,
      },
      data: {
        deleted: true
      }
    })

    return deletedBroadcast
  }

  async findMany(query: FindManyMTBroadcastsDto) {
    const { limit = 10, offset = 0, searchValue } = query

    const findingQuery: any = {}

    if (searchValue) {
      findingQuery.OR = [
        { title: { contains: searchValue, mode: 'insensitive' }},
      ]
    }

    const [count, MTBroadcasts] = await Promise.all([
      this.database.mTBroadcast.count({
        where: {
          deleted: false,
          ...findingQuery,
        }
      }),
      this.database.mTBroadcast.findMany({
        take: limit,
        skip: offset,
        where: {
          deleted: false,
          ...findingQuery
        },
        orderBy: {
          id: "desc",
        },
      })
    ])

    return {
      count,
      records: MTBroadcasts
    }
  }

  async findOne(id: number) {
    const mtb = await this.database.mTBroadcast.findFirst({
      where: {
        id,
        deleted: false,
      }
    })

    if (!mtb) {
      throw new BadRequestException(`MT Broadcast not found with id: ${id}`)
    }

    return mtb
  }

  async findAll(req: Request) {
    const userInfo = req.user as RequestedUser;
    if (!userInfo.subUnitId) return [];
    const mtBroadcastData = await this.database.mTBroadcast.findMany({
      where: {
        deleted: false,
        User: {
          subUnit: {
            baseId: userInfo.subUnit.baseId,
          },
        },
      },
      include: {
        User: {
          include: {
            subUnit: {
              include: {
                base: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return mtBroadcastData.map(({ id, title, file }) => {
      return {
        id,
        title,
        path: this.config.get('AUTH_AD_REDIRECT_DOMAIN') + '/' + file,
      };
    });
  }
}
