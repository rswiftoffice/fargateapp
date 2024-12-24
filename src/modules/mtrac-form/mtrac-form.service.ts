import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { buildFindingQueryInRange } from 'src/helpers/build';
import { DatabaseService } from '../../core/database/database.service';
import { ExportMTRACFormDto, FindManyMTRACFormDto } from './dto/mtrac-form.dto';
import { Role } from '@prisma/client';
import { RequestedUser } from '../users/entities/user.entity';
import { Request } from 'express';

@Injectable()
export class MTRACFormService {
  constructor(private readonly database: DatabaseService) { }

  async findMany(req: Request, query: FindManyMTRACFormDto) {
    const user = req.user as RequestedUser;
    const currentRole = user.roles[0];

    const {
      limit = 10,
      offset = 0,
      searchValue,
      approvalStatus,
      driverName,
      vehicleNumber,
      despatchDate,
      releaseDate,
      tripDateRange,
    } = query;

    const findingQuery: any = {};

    if (searchValue) {
      findingQuery.OR = [
        { overAllRisk: { contains: searchValue, mode: 'insensitive' } },
        {
          trip: {
            vehicle: {
              subUnit: { name: { contains: searchValue, mode: 'insensitive' } },
            },
          },
        },
        {
          trip: {
            vehicle: {
              subUnit: {
                base: { name: { contains: searchValue, mode: 'insensitive' } },
              },
            },
          },
        },
        {
          trip: {
            vehicle: {
              subUnit: {
                base: {
                  command: {
                    name: { contains: searchValue, mode: 'insensitive' },
                  },
                },
              },
            },
          },
        },
        {
          trip: {
            vehicle: {
              subUnit: {
                base: {
                  command: {
                    service: {
                      name: { contains: searchValue, mode: 'insensitive' },
                    },
                  },
                },
              },
            },
          },
        },
      ];
    }

    const dbQuery: any = [];

    if (approvalStatus && approvalStatus !== 'All') {
      dbQuery.push(
        {
          status: approvalStatus,
        },
      );
    }

    if (driverName) {
      dbQuery.push(
        {
          trip: {
            driver: {
              name: {
                contains: driverName,
                mode: 'insensitive',
              },
            },
          },
        },
      );
    }

    if (vehicleNumber) {
      dbQuery.push(
        {
          trip: {
            vehicle: {
              vehicleNumber: { contains: vehicleNumber, mode: 'insensitive' },
            },
          }
        },
      );
    }

    if (despatchDate) {
      dbQuery.push(
        {
          dispatchDate: {
            gte: moment(despatchDate)
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
              .toISOString(),
            lt: moment(despatchDate)
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
              .add(1, 'd')
              .toISOString(),
          },
        },
      );
    }

    if (releaseDate) {
      dbQuery.push(
        {
          releaseDate: {
            gte: moment(releaseDate)
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
              .toISOString(),
            lt: moment(releaseDate)
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
              .add(1, 'd')
              .toISOString(),
          },
        },
      );
    }

    if (tripDateRange) {
      dbQuery.push(
        {
          trip: {
            tripDate: {
              gte: tripDateRange.startDate,
              lt: moment.utc(tripDateRange.endDate).add(1, 'd').toISOString(),
            },
          },
        },
      );
    }

    if (currentRole == Role.SERVICES) {
      dbQuery.push({
        trip: {
          vehicle: {
            subUnit: {
              base: {
                command: {
                  service: {
                    id: Number(user?.serviceId ?? -1),
                  },
                },
              },
            },
          },
        }
      })
    } else if (currentRole == Role.COMMAND) {
      dbQuery.push({
        trip: {
          vehicle: {
            subUnit: {
              base: {
                command: {
                  id: Number(user?.commandId ?? -1),
                },
              },
            },
          }
        },
      })
    } else if (currentRole == Role.BASE) {
      dbQuery.push({
        trip: {
          vehicle: {
            subUnit: {
              base: {
                id: Number(user?.baseAdminId ?? -1),
              },
            },
          },
        }
      })
    } else if (currentRole == Role.SUB_UNIT) {
      dbQuery.push({
        trip: {
          vehicle: {
            subUnit: {
              id: Number(user?.adminSubUnitId ?? -1),
            },
          },
        }
      })
    } else if (currentRole == Role.AUDITOR) {
      dbQuery.push({
        trip: {
          vehicle: {
            subUnit: {
              id: Number(user?.subUnitId ?? -1),
            },
          },
        }
      })
    }
    findingQuery.AND = dbQuery;

    const [count, records] = await Promise.all([
      this.database.mTRACForm.count({
        where: {
          deleted: false,
          ...findingQuery,
        },
      }),
      this.database.mTRACForm.findMany({
        take: limit,
        skip: offset,
        where: {
          deleted: false,
          ...findingQuery,
        },
        include: {
          quizzes: true,
          trip: {
            include: {
              vehicle: {
                include: {
                  subUnit: {
                    include: {
                      base: {
                        include: {
                          command: {
                            include: {
                              service: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              approvingOfficer: true,
              driver: true,
            },
          },
        },
        orderBy: {
          trip: {
            tripDate: 'desc',
          },
        },
      }),
    ]);

    return {
      count,
      records,
    };
  }

  async getExportData(query: ExportMTRACFormDto) {
    const [records] = await Promise.all([
      await this.database.mTRACForm.findMany({
        where: {
          AND: [
            {
              ...(query.currentRole == Role.SERVICES
                ? {
                  trip: {
                    vehicle: {
                      subUnit: {
                        base: {
                          command: {
                            service: {
                              id: query?.serviceId ?? -1,
                            },
                          },
                        },
                      },
                    },
                  },
                }
                : query.currentRole == Role.COMMAND
                  ? {
                    trip: {
                      vehicle: {
                        subUnit: {
                          base: {
                            command: {
                              id: query?.commandId ?? -1,
                            },
                          },
                        },
                      },
                    },
                  }
                  : query.currentRole == Role.BASE
                    ? {
                      trip: {
                        vehicle: {
                          subUnit: {
                            base: {
                              id: query?.baseAdminId ?? -1,
                            },
                          },
                        },
                      },
                    }
                    : query.currentRole == Role.SUB_UNIT
                      ? {
                        trip: {
                          vehicle: {
                            subUnit: {
                              id: query?.adminSubUnitId ?? -1,
                            },
                          },
                        },
                      }
                      : query.currentRole == Role.AUDITOR
                        ? {
                          trip: {
                            vehicle: {
                              subUnit: {
                                id: query?.subUnitId ?? -1,
                              },
                            },
                          },
                        }
                        : {}),
            },
            {
              createdAt: {
                gte: query.fromDate,
                lte: query.toDate,
              },
            },
            {
              deleted: false,
            },
          ],
        },
        include: {
          quizzes: true,
          trip: {
            include: {
              vehicle: {
                include: {
                  subUnit: {
                    include: {
                      base: {
                        include: {
                          command: {
                            include: {
                              service: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              approvingOfficer: true,
              driver: true,
            },
          },
        },
      }),
    ]);

    return {
      records: records,
    };
  }
}
