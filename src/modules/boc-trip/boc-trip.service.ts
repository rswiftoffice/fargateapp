import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { DatabaseService } from 'src/core/database/database.service';
import { buildFindingQueryInRange } from 'src/helpers/build';
import { ExportBocTripDto, FindManyBocTripDto } from './dto/boc-trip.dto';
import { Role } from '@prisma/client';

@Injectable()
export class BocTripService {
  constructor(private database: DatabaseService) {}
  async findMany(query: FindManyBocTripDto) {
    const {
      limit = 10,
      offset = 0,
      searchValue,
      tripDate,
      driverName,
      vehicleNumber, currentRole, subUnitId, adminSubUnitId, baseAdminId, serviceId, commandId
    } = query;

    const findingQuery: any = {};

    if (searchValue) {
      findingQuery.OR = [
        {
          requisitionerPurpose: { contains: searchValue, mode: 'insensitive' },
        },
      ];
    }
    const dbQuery:any = [];
    if (tripDate) {
      dbQuery.push(
        {
          tripDate: {
            gte: moment(tripDate).startOf('day').toDate(),
            lte: moment(tripDate).endOf('day').toDate(),
          },
        },
      );
    }

    if (driverName) {
      dbQuery.push(
        {
          driver: {
            name: { contains: driverName, mode: 'insensitive' },
          },
        },
      );
    }

    if (vehicleNumber) {
      dbQuery.push(
        {
          vehicle: {
            vehicleNumber: { contains: vehicleNumber, mode: 'insensitive' },
          },
        },
      );
    }
    if(currentRole == Role.SERVICES) {
      dbQuery.push({
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
      })
    } else if(currentRole == Role.COMMAND) {
      dbQuery.push({
        vehicle: {
          subUnit: {
            base: {
              command: {
                id: Number(commandId ?? -1),
              },
            },
          },
        },
      })
    } else if(currentRole == Role.BASE) {
      dbQuery.push({
        vehicle: {
          subUnit: {
            base: {
              id: Number(baseAdminId ?? -1),
            },
          },
        },
      })
    } else if(currentRole == Role.SUB_UNIT) {
      dbQuery.push({
        vehicle: {
          subUnit: {
            id: Number(adminSubUnitId ?? -1),
          },
        },
      })
    } else if(currentRole == Role.AUDITOR) {
      dbQuery.push({
        vehicle: {
          subUnit: {
            id: Number(subUnitId ?? -1),
          },
        },
      })
    }
    findingQuery.AND = dbQuery;

    const [count, items] = await Promise.all([
      this.database.bocTrip.count({
        where: {
          deleted: false,
          ...findingQuery,
        },
      }),
      this.database.bocTrip.findMany({
        where: {
          deleted: false,
          ...findingQuery,
        },
        take: limit,
        skip: offset,
        include: {
          vehicle: true,
          driver: true,
          eLog: {
            include: {
              destination: {
                include: {
                  trip: {
                    include: {
                      vehicle: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          tripDate: 'desc',
        },
      }),
    ]);

    return {
      count,
      records: items,
    };
  }

  async getExportData(query: ExportBocTripDto) {
    const [records] = await Promise.all([
      await this.database.bocTrip.findMany({
        where: {
          AND:
            query?.currentRole == Role.SERVICES
              ? [
                  {
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
              : query?.currentRole == Role.COMMAND
              ? [
                  {
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
              : query?.currentRole == Role.BASE
              ? [
                  {
                    vehicle: {
                      subUnit: {
                        base: {
                          id: query?.baseAdminId ?? -1,
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
              : query?.currentRole == Role.SUB_UNIT
              ? [
                  {
                    vehicle: {
                      subUnit: {
                        id: query?.adminSubUnitId ?? -1,
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
              : query?.currentRole == Role.AUDITOR
              ? [
                  {
                    vehicle: {
                      subUnit: {
                        id: query?.subUnitId ?? -1,
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
                    deleted: false,
                  },
                ],
        },
        include: {
          driver: true,
          vehicle: true,
          eLog: true,
        },
        orderBy: {
          tripDate: 'desc',
        },
      }),
    ]);

    return {
      records: records,
    };
  }
}
