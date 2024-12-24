import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as moment from 'moment';
import { DatabaseService } from 'src/core/database/database.service';
import { buildFindingQueryInRange } from 'src/helpers/build';
import { RequestedUser } from '../users/entities/user.entity';
import { ExportELogsDto, FindManyELogsDto } from './dto/eLog.dto';

@Injectable()
export class ELogService {
  constructor(private database: DatabaseService) {}

  async findElogs(req: Request, vehicleId) {
    const user = req.user as RequestedUser;
    const startdate = moment().subtract(14, 'days').format();

    const vehicleExists = await this.database.vehicle.findFirst({
      where: {
        id: vehicleId,
        ...(user.hasBaseLevelVehiclesAccess
          ? {
              subUnit: {
                deleted: false,
                base: {
                  deleted: false,
                  id: user.subUnit.baseId,
                },
              },
            }
          : {
              subUnit: {
                id: user.subUnitId,
                deleted: false,
              },
            }),
        deleted: false,
      },
    });

    if (!vehicleExists) {
      throw new BadRequestException(
        `Vehicle does not exist with id ${vehicleId} or user's subunit is not match with vehicle subunit!`,
      );
    }

    const eLogs = await this.database.eLog.findMany({
      where: {
        destination: {
          trip: {
            vehicle: {
              id: vehicleId,
              ...(user.hasBaseLevelVehiclesAccess
                ? {
                    subUnit: {
                      deleted: false,
                      base: {
                        deleted: false,
                        id: user.subUnit.baseId,
                      },
                    },
                  }
                : {
                    subUnit: {
                      id: user.subUnitId,
                      deleted: false,
                    },
                  }),
            },
          },
        },
        createdAt: {
          gte: startdate,
        },
        deleted: false,
      },
      include: {
        destination: {
          include: {
            trip: {
              include: {
                driver: true,
                vehicle: true,
                approvingOfficer: true,
              },
            },
            approvingOfficer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const reStructuredElog = eLogs.map(
      ({
        id,
        startTime,
        endTime,
        stationaryRunningTime,
        meterReading,
        totalDistance,
        destination,
      }) => {
        return {
          id,
          vehicleNumber: destination.trip.vehicle.vehicleNumber,
          tripDate: destination.trip.tripDate,
          to: destination.to,
          requisitionerPurpose: destination.requisitionerPurpose,
          tripStatus: destination.trip.tripStatus,
          startTime,
          endTime,
          stationaryRunningTime,
          meterReading,
          totalDistance,
          driverName: destination.trip.driver.name,
          approvingOfficer: destination.trip.approvingOfficer?.name || null,
        };
      },
    );
    return reStructuredElog;
  }

  async findBocTrip(req: Request, vehicleId) {
    const user = req.user as RequestedUser;
    const startdate = moment().subtract(14, 'days').format();

    const vehicleExists = await this.database.vehicle.findFirst({
      where: {
        id: vehicleId,
        ...(user.hasBaseLevelVehiclesAccess
          ? {
              subUnit: {
                deleted: false,
                base: {
                  deleted: false,
                  id: user.subUnit.baseId,
                },
              },
            }
          : {
              subUnit: {
                id: user.subUnitId,
                deleted: false,
              },
            }),
        deleted: false,
      },
    });

    if (!vehicleExists) {
      throw new BadRequestException(
        `Vehicle does not exist with id ${vehicleId} or user's subunit is not match with vehicle subunit!`,
      );
    }

    const eLogs = await this.database.eLog.findMany({
      where: {
        bocTrip: {
          vehicleId,
        },
        createdAt: {
          gte: startdate,
        },
        deleted: false,
      },
      include: {
        bocTrip: {
          include: {
            driver: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const reStructuredElog = eLogs.map((elog) => {
      return {
        id: elog.id,
        tripDate: elog.bocTrip.tripDate,
        startTime: elog.startTime,
        endTime: elog.endTime,
        meterReading: elog.meterReading,
        requisitionerPurpose: elog.bocTrip.requisitionerPurpose,
        driverName: elog.bocTrip.driver.name,
      };
    });
    return reStructuredElog;
  }

  async findMany(query: FindManyELogsDto) {
    const { limit = 10, offset = 0, searchValue } = query

    const findingQuery: any = {}

    if (searchValue) {
      findingQuery.OR = [
        { destination: { to: { contains: searchValue, mode:'insensitive' } } },
        { destination: { requisitionerPurpose: { contains: searchValue, mode: 'insensitive'}}},
        { destination: { trip: { approvingOfficer: { name: { contains: searchValue, mode: 'insensitive' }}}}},
        { destination: { trip: { vehicle: { vehicleNumber: { contains: searchValue, mode: 'insensitive'}}}}},
        { destination: { trip: { driver: { name: { contains: searchValue, mode: 'insensitive'}}}}},
      ]
    }

    const [count, eLogs] = await Promise.all([
      this.database.eLog.count({
        where: {
          deleted: false,
          ...findingQuery,
        }
      }),
      this.database.eLog.findMany({
        take: limit,
        skip: offset,
        where: {
          deleted: false,
          ...findingQuery,
        },
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
              tripDate: "desc",
            },
          },
        },
      })
    ])

    return {
      count,
      records: eLogs
    }
  }

  async getExportData(query: ExportELogsDto) {
    const exportData =  await this.database.eLog.findMany({
      where: {
        createdAt: buildFindingQueryInRange(query.fromDate, query.toDate),
        deleted: false,
      },
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
            tripDate: "asc",
          },
        },
      },
    })

    if (!exportData?.length) {
      throw new BadRequestException('No Data Found!')
    }

    const mapData = exportData.map((data) => ({
      Id: data.id,
      Vehicle_Number: data?.destination?.trip?.vehicle?.vehicleNumber ?? "N/A",
      Trip_Date: data?.destination?.trip?.tripDate
        ? moment.utc(data?.destination?.trip?.tripDate).local().format("MMMM DD, YYYY")
        : "N/A",
      To_Destination: data?.destination?.to ?? "N/A",
      Requisitioner_Purpose: data?.destination?.requisitionerPurpose ?? "N/A",
      Start_Time: moment.utc(data.startTime).local().format("HH:mm"),
      End_Time: data?.endTime ? moment.utc(data?.endTime).local().format("HH:mm") : "N/A",
      Stationary_Running_Time: data?.stationaryRunningTime ?? "N/A",
      End_Meter_Reading: data.meterReading,
      Total_Distance: data.totalDistance,
      Driver_Name: data?.destination?.trip?.driver?.name ?? "N/A",
      Approving_Officer: data?.destination?.trip?.approvingOfficer?.name ?? "N/A",
      Remarks: data?.remarks ?? "N/A",
    }))

    return mapData
  }
}
