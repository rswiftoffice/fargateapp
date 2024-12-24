import { CheckInOutType } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { DatabaseService } from 'src/core/database/database.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { VehicleService } from '../vehicles/vehicles.service';
import { Request } from 'express';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { RequestedUser } from '../users/entities/user.entity';
import * as _ from 'lodash';
import { CreateUpdatesDto } from '../updates/dto/create-update.dto';
import { isJSON } from 'class-validator';
import { buildFindingQueryInRange } from 'src/helpers/build';
import { ExportCheckInDto, FindManyCheckInDto } from './dto/check-in-dto';
import { Role } from '@prisma/client';

@Injectable()
export class CheckInService {
  constructor(
    private database: DatabaseService,
    private auditLogService: AuditLogService,
    private vehicleService: VehicleService,
  ) {}
  async create(body: any, req: Request) {
    const MAC = req.user as RequestedUser;
    const {
      workCenter,
      telephoneNo,
      speedoReading,
      swdReading,
      dateIn,
      expectedCheckoutDate,
      expectedCheckoutTime,
      handedBy,
      attender,
      vehicleId,
      checkInType,
      frontSensorTag,
      preventiveMaintenance,
      correctiveMaintenance,
      annualVehicleInspection,
      basicIssueTools,
      images,
    } = body;

    if (
      !basicIssueTools ||
      !isJSON(basicIssueTools) ||
      !Array.isArray(JSON.parse(basicIssueTools)) ||
      JSON.parse(basicIssueTools).length <= 0 ||
      JSON.parse(basicIssueTools).filter((element) => {
        if (element.name === undefined || element.quantity === undefined)
          return true;
      }).length > 0
    ) {
      throw new BadRequestException([
        'basicIssueTools Should not be empty',
        'basicIssueTools must be an array of object that contains name as string and quantity as number',
      ]);
    }

    if (
      (checkInType === CheckInOutType.AVI && !annualVehicleInspection) ||
      (checkInType === CheckInOutType.AVI &&
        isJSON(annualVehicleInspection) &&
        JSON.parse(annualVehicleInspection).defect === undefined)
    ) {
      throw new BadRequestException([
        'annualVehicleInspection Should not be empty',
        'annualVehicleInspection must be a object with value like defect: string',
      ]);
    }

    if (
      (checkInType === CheckInOutType.Corrective && !correctiveMaintenance,
      checkInType === CheckInOutType.Corrective &&
        isJSON(correctiveMaintenance) &&
        JSON.parse(correctiveMaintenance).correctiveMaintenance === undefined)
    ) {
      throw new BadRequestException([
        'correctiveMaintenance Should not be empty',
        'correctiveMaintenance must be a object with string value of correctiveMaintenance like correctiveMaintenance: string',
      ]);
    }

    if (
      (checkInType === CheckInOutType.Preventive && !preventiveMaintenance,
      (checkInType === CheckInOutType.Preventive &&
        isJSON(preventiveMaintenance) &&
        JSON.parse(preventiveMaintenance).defect === undefined) ||
        (checkInType === CheckInOutType.Preventive &&
          isJSON(preventiveMaintenance) &&
          JSON.parse(preventiveMaintenance).type === undefined))
    ) {
      throw new BadRequestException([
        'preventiveMaintenance Should not be empty',
        'preventiveMaintenance must be a object with string value of preventiveMaintenance like defect: string , type: string',
      ]);
    } else {
      const validVehicle = await this.vehicleService.validateVehicleForTrip(
        MAC,
        +vehicleId,
      );

      if (!validVehicle.valid) {
        throw new BadRequestException(validVehicle.message);
      }

      const vehicleAlreadyInCheckin = await this.database.vehicle.findFirst({
        where: {
          id: +vehicleId,
          subUnit: {
            id: MAC.subUnitId,
          },
          vehicleServicing: {
            some: {
              checkOut: null,
            },
          },
          deleted: false,
        },
        include: {
          vehicleServicing: {
            include: {
              checkIn: true,
              checkOut: true,
            },
          },
        },
      });

      if (vehicleAlreadyInCheckin) {
        throw new BadRequestException('Vehicle is already in checkin!');
      }

      const checkInServiceData = await this.database.checkIn.create({
        data: {
          workCenter,
          telephoneNo,
          speedoReading,
          dateIn,
          expectedCheckoutDate,
          expectedCheckoutTime,
          handedBy,
          attender,
          checkInType,
          frontSensorTag,
          swdReading,
          ...(images?.length > 0
            ? {
                images: {
                  createMany: {
                    data: images.map(
                      ({ mimetype, encoding, originalName, path, size }) => ({
                        mimetype,
                        encoding,
                        originalName,
                        path:
                          '/uploads/' +
                          path.replace(/\\/g, '/').split('/')[
                            path.replace(/\\/g, '/').split('/').length - 1
                          ],
                        size,
                      }),
                    ),
                  },
                },
              }
            : {}),
          vehicleServicing: {
            create: {
              maintenanceType: checkInType,
              vehicle: {
                connect: {
                  id: +vehicleId,
                },
              },
            },
          },
          basicIssueTools: {
            createMany: {
              data: JSON.parse(basicIssueTools).map(({ name, quantity }) => ({
                name,
                quantity,
              })),
            },
          },
          ...(checkInType === CheckInOutType.Preventive
            ? {
                preventiveMaintenance: {
                  create: {
                    type: JSON.parse(preventiveMaintenance).type,
                    defect: JSON.parse(preventiveMaintenance).defect,
                  },
                },
              }
            : {}),
          ...(checkInType === CheckInOutType.Corrective
            ? {
                correctiveMaintenance: {
                  create: {
                    correctiveMaintenance: JSON.parse(correctiveMaintenance)
                      .correctiveMaintenance,
                  },
                },
              }
            : {}),
          ...(checkInType === CheckInOutType.AVI
            ? {
                annualVehicleInspection: {
                  create: {
                    defect: JSON.parse(annualVehicleInspection).defect,
                  },
                },
              }
            : {}),
        },
      });
      if (checkInServiceData) {
        const auditLogDate = moment(checkInServiceData.createdAt).format(
          'DD/MM/YYYY hh:mm',
        );

        await this.auditLogService.create({
          addedBy: MAC.id,
          currentRole: 'MAC',
          description: `${auditLogDate} CheackIn "${checkInServiceData.id}" has been CREATED by User (${MAC.name})!`,
          name: MAC.name,
        });
      }

      return checkInServiceData;
    }
  }

  async findAllVehicles(req: Request) {
    const MAC = req.user as RequestedUser;
    const vehicles = await this.database.vehicle.findMany({
      where: {
        vehicleServicing: {
          some: {
            checkOut: null,
          },
        },
        subUnit: {
          id: MAC.subUnitId,
        },
        deleted: false,
      },
    });
    return _.map(vehicles, (vehicle) => _.omit(vehicle, ['deleted']));
  }

  async findOne(vehicleId: number, req: Request) {
    const MAC = req.user as RequestedUser;

    const vehicleAlreadyInCheckin = await this.database.vehicle.findFirst({
      where: {
        id: vehicleId,
        subUnit: {
          id: MAC.subUnitId,
        },
        vehicleServicing: {
          some: {
            checkOut: null,
          },
        },
        deleted: false,
      },
      include: {
        vehicleServicing: {
          include: {
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    if (!vehicleAlreadyInCheckin) {
      throw new BadRequestException('Vehicle is not in  checkin!');
    }

    const validVehicle = await this.vehicleService.validateVehicleForTrip(
      MAC,
      vehicleId,
    );

    if (!validVehicle.valid) {
      throw new BadRequestException(validVehicle.message);
    }

    const checkInService = await this.database.checkIn.findFirst({
      where: {
        vehicleServicing: {
          vehicleId,
        },
      },
    });

    if (checkInService) {
      const checkInServiceData = await this.database.checkIn.findFirst({
        where: {
          vehicleServicing: {
            vehicleId,
            checkOut: null,
          },
          deleted: false,
        },
        include: {
          vehicleServicing: true,
          basicIssueTools: true,
          images: {
            select: {
              id: true,
              originalName: true,
              encoding: true,
              mimetype: true,
              path: true,
              size: true,
            },
          },
          ...(checkInService.checkInType === CheckInOutType.AVI
            ? {
                annualVehicleInspection: true,
              }
            : {}),
          ...(checkInService.checkInType === CheckInOutType.Corrective
            ? {
                correctiveMaintenance: true,
              }
            : {}),
          ...(checkInService.checkInType === CheckInOutType.Preventive
            ? {
                preventiveMaintenance: true,
              }
            : {}),
        },
      });

      return checkInServiceData;
    }

    return checkInService;
  }

  //view  update log of a vehicle which is in checkin

  async FindUpdateLogOfCheckIns(vehicleServicingId: number, req: Request) {
    const MAC = req.user as RequestedUser;

    const validVehicleService = await this.database.vehicleServicing.findFirst({
      where: {
        id: vehicleServicingId,
        vehicle: {
          subUnitId: MAC.subUnitId,
        },
        deleted: false,
      },
    });

    if (!validVehicleService) {
      throw new BadRequestException(
        `vehicleService is not exist with id ${vehicleServicingId} Or user is not related with this vehicleServiceing`,
      );
    }
    const findOfVehicleServicingUpdates = await this.database.updates.findMany({
      where: {
        deleted: false,
        vehicleServicingId,
      },
    });

    return _.map(
      findOfVehicleServicingUpdates,
      (findOfVehicleServicingUpdate) =>
        _.omit(findOfVehicleServicingUpdate, ['deleted']),
    );
  }
  //Add update log of a vehicle which is in checkin

  async CreateUpdateLogOfCheckIns(body: CreateUpdatesDto, req: Request) {
    const { notes, dateOfCompletion, vehicleServicingId } = body;

    const MAC = req.user as RequestedUser;

    const validVehicleService = await this.database.vehicleServicing.findFirst({
      where: {
        id: vehicleServicingId,
        vehicle: {
          subUnitId: MAC.subUnitId,
        },
        deleted: false,
      },
    });

    if (!validVehicleService) {
      throw new BadRequestException(
        `vehicleService is not exist with id ${vehicleServicingId} Or user is not related with this vehicleServiceing`,
      );
    }

    const updatesOfVehicleServicing = await this.database.updates.create({
      data: {
        notes,
        dateOfCompletion,
        vehicleServicing: {
          connect: {
            id: vehicleServicingId,
          },
        },
      },
    });
    delete updatesOfVehicleServicing.deleted;
    return updatesOfVehicleServicing;
  }

  async remove(id: number) {
    const checkInServiceData = await this.database.checkIn.delete({
      where: {
        id: id,
      },
    });
    if (!checkInServiceData) return {};
    return checkInServiceData;
  }

  async findMany(query: FindManyCheckInDto) {
    const {
      limit = 10,
      offset = 0,
      searchValue,
      checkInOutType,
      frontSensorTag,
    } = query;

    const findingQuery: any = {};

    if (searchValue) {
      findingQuery.OR = [
        {
          workCenter: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
        {
          telephoneNo: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
        {
          speedoReading: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
        {
          handedBy: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
        {
          attender: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (checkInOutType && checkInOutType !== 'All') {
      findingQuery.AND = [
        {
          checkInType: checkInOutType,
        },
      ];
    }

    if (frontSensorTag && frontSensorTag !== 'All') {
      findingQuery.AND = [
        {
          frontSensorTag: frontSensorTag,
        },
      ];
    }

    const [count, records] = await Promise.all([
      this.database.checkIn.count({
        where: {
          deleted: false,
          ...findingQuery,
        },
      }),
      this.database.checkIn.findMany({
        take: limit,
        skip: offset,
        where: {
          deleted: false,
          ...findingQuery,
        },
        include: {
          images: true,
          annualVehicleInspection: true,
          basicIssueTools: true,
          correctiveMaintenance: true,
          preventiveMaintenance: true,
          vehicleServicing: true,
        },
        orderBy: {
          dateIn: 'desc',
        },
      }),
    ]);

    return {
      count,
      records,
    };
  }

  async exportCSV(query: ExportCheckInDto) {
    const [records] = await Promise.all([
      await this.database.checkIn.findMany({
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
          correctiveMaintenance: true,
          preventiveMaintenance: true,
          vehicleServicing: true,
        },
      }),
    ]);

    return {
      records: records,
    };
  }
}
