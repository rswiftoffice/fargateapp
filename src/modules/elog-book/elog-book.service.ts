import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { DatabaseService } from 'src/core/database/database.service';
import { buildFindingQueryInRange } from 'src/helpers/build';
import { ExportELogBookDto, FindManyELogBookDto } from './dto/elog-book.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ElogBookService {
  constructor(private database: DatabaseService) { }
  async findMany(query: FindManyELogBookDto) {
    const { limit = 10, offset = 0, searchValue, driverName, vehicleNumber, tripDate, currentRole, subUnitId, adminSubUnitId, baseAdminId, serviceId, commandId } = query;

    const findingQuery: any = {};

    if (searchValue) {
      findingQuery.OR = [
        {
          destination: {
            to: { contains: searchValue, mode: 'insensitive' },
          },
        },
        {
          destination: {
            requisitionerPurpose: {
              contains: searchValue,
              mode: 'insensitive',
            },
          },
        },
        {
          destination: {
            trip: {
              vehicle: {
                vehicleNumber: { contains: searchValue, mode: 'insensitive' },
              },
            },
          },
        },
        {
          destination: {
            trip: {
              approvingOfficer: {
                name: { contains: searchValue, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }
    const dbQuery: any = [];
    if (driverName) {
      dbQuery.push({
        destination: {
          trip: {
            driver: {
              name: { contains: driverName, mode: 'insensitive' },
            },
          },
        },
      });
    }

    if (vehicleNumber) {
      dbQuery.push({
          destination: {
            trip: {
              vehicle: {
                vehicleNumber,
              },
            },
          },
        },
      );
    }

    if (tripDate) {
      dbQuery.push({
          destination: {
            trip: {
              tripDate: {
                gte: moment(tripDate)
                  .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                  .toISOString(),
                lt: moment(tripDate)
                  .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                  .add(1, 'd')
                  .toISOString(),
              },
            },
          },
        },
      );
    }
    dbQuery.push({
      ...(currentRole === Role.SERVICES
        ? {
            destination: {
              trip: {
                vehicle: {
                  subUnit: {
                    base: {
                      command: {
                        service: {
                          id: Number(serviceId ?? -1),
                        },
                      },
                    },
                  },
                },
              },
            },
          }
        : currentRole === Role.COMMAND
        ? {
            destination: {
              trip: {
                vehicle: {
                  subUnit: {
                    base: {
                      command: {
                        id: Number(commandId ?? -1),
                      },
                    },
                  },
                },
              },
            },
          }
        : currentRole === Role.BASE
        ? {
            destination: {
              trip: {
                vehicle: {
                  subUnit: {
                    base: {
                      id: Number(baseAdminId ?? -1),
                    },
                  },
                },
              },
            },
          }
        : currentRole === Role.SUB_UNIT
        ? {
            destination: {
              trip: {
                vehicle: {
                  subUnit: {
                    id: Number(adminSubUnitId ?? -1),
                  },
                },
              },
            },
          }
        : currentRole === Role.AUDITOR
        ? {
            destination: {
              trip: {
                vehicle: {
                  subUnit: {
                    id: Number(subUnitId ?? -1),
                  },
                },
              },
            },
          }
        : {}),
    });
    findingQuery.AND = dbQuery;
    const [count, items] = await Promise.all([
      this.database.eLog.count({
        where: {
          deleted: false,
          destinationId: {
            not: null,
          },
          ...findingQuery,
        },
      }),
      this.database.eLog.findMany({
        where: {
          deleted: false,
          destinationId: {
            not: null,
          },
          ...findingQuery,
        },
        take: limit,
        skip: offset,
        include: {
          bocTrip: true,
          destination: {
            include: {
              trip: {
                include: {
                  vehicle: true,
                  driver: true,
                  approvingOfficer: true,
                },
              },
            },
          },
        },
        orderBy: {
          destination: {
            trip: {
              tripDate: 'desc',
            },
          },
        },
      }),
    ]);

    return {
      count,
      records: items,
    };
  }

  async getExportData(query: ExportELogBookDto) {
    const [records] = await Promise.all([
      this.database.eLog.findMany({
        include: {
          bocTrip: true,
          destination: {
            include: {
              trip: {
                include: {
                  vehicle: true,
                  driver: true,
                  approvingOfficer: true,
                },
              },
            },
          },
        },
        where: {
          AND:
            query.currentRole === Role.SERVICES
              ? [
                {
                  destination: {
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
                  },
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
              ]
              : query.currentRole === Role.COMMAND
                ? [
                  {
                    destination: {
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
                    },
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
                ]
                : query.currentRole === Role.BASE
                  ? [
                    {
                      destination: {
                        trip: {
                          vehicle: {
                            subUnit: {
                              base: {
                                id: query?.baseAdminId ?? -1,
                              },
                            },
                          },
                        },
                      },
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
                  ]
                  : query.currentRole === Role.SUB_UNIT
                    ? [
                      {
                        destination: {
                          trip: {
                            vehicle: {
                              subUnit: {
                                id: query?.adminSubUnitId ?? -1,
                              },
                            },
                          },
                        },
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
                    ]
                    : query.currentRole === Role.AUDITOR
                      ? [
                        {
                          destination: {
                            trip: {
                              vehicle: {
                                subUnit: {
                                  id: query?.subUnitId ?? -1,
                                },
                              },
                            },
                          },
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
                      ]
                      : [
                        {
                          createdAt: {
                            gte: query.fromDate,
                            lte: query.toDate,
                          },
                        },
                        {
                          destination: {
                            trip: {
                              driver: {
                                name: {
                                  contains: '',
                                },
                              },
                            },
                          },
                        },
                        {
                          deleted: false,
                        },
                      ],
        },
      }),
    ]);

    return {
      records: records,
    };
  }
}
