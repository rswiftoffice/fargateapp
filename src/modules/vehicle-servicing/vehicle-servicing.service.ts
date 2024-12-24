import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/core/database/database.service';
import { RequestedUser } from '../users/entities/user.entity';
import { Request } from 'express';
import { CheckInOutType } from '.prisma/client';
import * as _ from 'lodash';
import {
  ExportVehicleServicingDto,
  FindManyVehicleServicesDto,
} from './dto/vehicle-servicing.dto';
import { buildFindingQueryInRange } from 'src/helpers/build';
import * as moment from 'moment';
import { Role } from '@prisma/client';

@Injectable()
export class VehicleServicingService {
  constructor(private database: DatabaseService) {}
  async findAllByDriver(req: Request, type: CheckInOutType) {
    const user = req.user as RequestedUser;

    const userBase = await this.database.base.findFirst({
      where: {
        deleted: false,
        subUnits: {
          some: {
            id: user.subUnitId,
            deleted: false,
          },
        },
      },
    });

    if (userBase) {
      const vehicleServices = await this.database.vehicleServicing.findMany({
        where: {
          maintenanceType: type,
          deleted: false,
          vehicle: {
            subUnit: {
              id: user.subUnitId,
              baseId: userBase.id,
              deleted: false,
            },
          },
          checkOut: null,
        },
        include: {
          vehicle: true,
        },
      });

      return _.map(vehicleServices, (vehicleService) =>
        _.omit(vehicleService, ['deleted']),
      );
    }
    return [];
  }
  async findAllByMac(req: Request, type: CheckInOutType) {
    const user = req.user as RequestedUser;

    const userBase = await this.database.base.findFirst({
      where: {
        deleted: false,
        subUnits: {
          some: {
            id: user.subUnitId,
            deleted: false,
          },
        },
      },
    });

    if (userBase) {
      const vehicleServices = await this.database.vehicleServicing.findMany({
        where: {
          maintenanceType: type,
          deleted: false,
          vehicle: {
            subUnit: {
              id: user.subUnitId,
              // baseId: userBase.id,
              deleted: false,
            },
          },
          checkOut: null,
        },
        include: {
          vehicle: true,
        },
      });

      return _.map(vehicleServices, (vehicleService) =>
        _.omit(vehicleService, ['deleted']),
      );
    }
    return [];
  }

  async findMany(query: FindManyVehicleServicesDto) {
    const {
      limit = 10,
      offset = 0,
      searchValue,
      maintenanceType,
      maintenanceStatus,
      tripDate,
    } = query;

    const findingQuery: any = {};

    if (searchValue) {
      findingQuery.OR = [
        {
          vehicle: {
            vehicleNumber: { contains: searchValue, mode: 'insensitive' },
          },
        },
      ];
    }

    if (maintenanceType && maintenanceType !== 'All') {
      findingQuery.AND = [
        {
          maintenanceType: maintenanceType,
        },
      ];
    }

    if (maintenanceStatus && maintenanceStatus !== 'All') {
      findingQuery.AND = [
        {
          status: maintenanceStatus,
        },
      ];
    }

    if (tripDate) {
      findingQuery.AND = [
        {
          createdAt: {
            gte: moment(tripDate)
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
              .toISOString(),
            lt: moment(tripDate)
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
              .add(1, 'd')
              .toISOString(),
          },
        },
      ];
    }

    const [count, records] = await Promise.all([
      this.database.vehicleServicing.count({
        where: {
          deleted: false,
        },
      }),
      this.database.vehicleServicing.findMany({
        take: limit,
        skip: offset,
        where: {
          deleted: false,
          ...findingQuery,
        },
        include: {
          vehicle: true,
          checkIn: true,
          checkOut: true,
          updates: true,
        },
        orderBy: {
          checkIn: {
            dateIn: 'desc',
          },
        },
      }),
    ]);

    return {
      count,
      records,
    };
  }

  async exportCSV(query: ExportVehicleServicingDto) {
    const [records] = await Promise.all([
      await this.database.vehicleServicing.findMany({
        where: {
          AND:
            query.currentRole == Role.SERVICES
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
              : query.currentRole == Role.COMMAND
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
              : query.currentRole == Role.BASE
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
              : query.currentRole == Role.SUB_UNIT
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
              : query.currentRole == Role.MAINTENANCE
              ? [
                  {
                    vehicle: {
                      subUnit: {
                        base: {
                          id: query?.baseId ?? -1,
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
                    deleted: false,
                  },
                ],
        },
        include: {
          checkIn: true,
          checkOut: true,
          updates: true,
          vehicle: true,
        },
      }),
    ]);

    return {
      records: records,
    };
  }
}
