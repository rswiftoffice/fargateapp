import { CheckInOutType } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/core/database/database.service';
import { CreateCheckOutDto } from './dto/create-check-out.dto';
import * as moment from 'moment';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Request } from 'express';
import { RequestedUser } from '../users/entities/user.entity';
import { ExportCheckOutsDto, FindManyCheckOutsDto } from './dto/check-out.dto';
import { buildFindingQueryInRange } from 'src/helpers/build';
import { Role } from '@prisma/client';
@Injectable()
export class CheckOutService {
  constructor(
    private database: DatabaseService,
    private auditLogService: AuditLogService,
  ) {}

  async create(body: CreateCheckOutDto, req: Request) {
    const {
      dateOut,
      speedoReading,
      swdReading,
      time,
      remark,
      attendedBy,
      workCenter,
      vehicleTakenOver,
      checkOutType,
      basicIssueTools,
      vehicleServicing,
      preventiveMaintenance,
      annualVehicleInspection,
    } = body;
    const MAC = req.user as RequestedUser;
    if (checkOutType === CheckInOutType.Preventive && !preventiveMaintenance) {
      throw new BadRequestException([
        'preventiveMaintenance Should not be empty',
      ]);
    }
    if (checkOutType === CheckInOutType.AVI && !annualVehicleInspection) {
      throw new BadRequestException([
        'annualVehicleInspection Should not be empty',
      ]);
    } else {
      const vehicleServicingExist =
        await this.database.vehicleServicing.findFirst({
          where: {
            id: vehicleServicing,
            deleted: false,
          },
        });
      if (!vehicleServicingExist)
        throw new BadRequestException([
          'vehicleServicing id should be correct!',
        ]);

      const alreadyCheckout = await this.database.checkOut.findFirst({
        where: {
          vehicleServicingId: vehicleServicing,
          deleted: false,
        },
      });
      if (alreadyCheckout)
        throw new BadRequestException(['Vehicle is already checkout!']);

      const checkOut = await this.database.checkOut.create({
        data: {
          dateOut,
          speedoReading,
          swdReading,
          time,
          remark,
          attendedBy,
          workCenter,
          vehicleTakenOver,
          checkOutType,
          vehicleServicing: {
            connect: {
              id: vehicleServicing,
            },
          },
          basicIssueTools: {
            createMany: {
              data: basicIssueTools.map(({ name, quantity }) => ({
                name,
                quantity,
              })),
            },
          },
          ...(checkOutType === CheckInOutType.Preventive
            ? {
                preventiveMaintenance: {
                  create: {
                    nextServicingDate: preventiveMaintenance.nextServicingDate,
                    nextServicingMileage:
                      preventiveMaintenance.nextServicingMileage,
                  },
                },
              }
            : {}),
          ...(checkOutType === CheckInOutType.AVI
            ? {
                annualVehicleInspection: {
                  create: {
                    nextAVIDate: annualVehicleInspection.nextAVIDate,
                  },
                },
              }
            : {}),
        },
      });
      if (checkOut) {
        const auditLogDate = moment(checkOut.createdAt).format(
          'DD/MM/YYYY hh:mm',
        );

        await this.auditLogService.create({
          addedBy: MAC.id,
          currentRole: 'MAC',
          description: `${auditLogDate} Checkout "${checkOut.id}" has been CREATED by User (${MAC.name})!`,
          name: MAC.name,
        });
      }
      return checkOut;
    }
  }

  async findMany(query: FindManyCheckOutsDto) {
    const { limit = 10, offset = 0, searchValue, checkInOutType } = query;

    const findingQuery: any = {};

    if (searchValue) {
      findingQuery.OR = [];
    }

    if (checkInOutType && checkInOutType !== 'All') {
      findingQuery.AND = [
        {
          checkOutType: checkInOutType,
        },
      ];
    }

    const [count, records] = await Promise.all([
      this.database.checkOut.count({
        where: {
          deleted: false,
          ...findingQuery,
        },
      }),
      this.database.checkOut.findMany({
        take: limit,
        skip: offset,
        where: {
          deleted: false,
          ...findingQuery,
        },
        include: {
          annualVehicleInspection: true,
          basicIssueTools: true,
          preventiveMaintenance: true,
          vehicleServicing: true,
        },
        orderBy: {
          dateOut: 'desc',
        },
      }),
    ]);

    return {
      count,
      records,
    };
  }

  async exportCSV(query: ExportCheckOutsDto) {
    const [records] = await Promise.all([
      await this.database.checkOut.findMany({
        where: {
          AND: [
            {
              ...(query.currentRole == Role.SERVICES
                ? {
                    vehicleServicing: {
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
                    vehicleServicing: {
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
                    vehicleServicing: {
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
                    vehicleServicing: {
                      vehicle: {
                        subUnit: {
                          id: query?.adminSubUnitId ?? -1,
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
          annualVehicleInspection: true,
          basicIssueTools: true,
          preventiveMaintenance: true,
          vehicleServicing: true,
        },
      }),
    ]);

    return {
      records,
    };
  }
}
