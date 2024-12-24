import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/core/database/database.service';
import { RequestedUser } from '../users/entities/user.entity';
import { VehicleService } from '../vehicles/vehicles.service';
import { CreateBosAosPolDto } from './dto/create-bos-aos-pol.dto';
import { UpdateBosAosPolDto } from './dto/update-bos-aos-pol.dto';
import { Request } from 'express';
import { AuditLogService } from '../audit-log/audit-log.service';
import * as moment from 'moment';
import {
  ExportBosAosPolDto,
  FindManyBosAosPolDto,
} from './dto/find-bos-aos-pol.dto';
import { buildFindingQueryInRange } from 'src/helpers/build';
import { Destination } from '@prisma/client';

@Injectable()
export class BosAosPolService {
  constructor(
    private database: DatabaseService,
    private vehicleService: VehicleService,
    private auditLogService: AuditLogService,
  ) {}

  async create(body: CreateBosAosPolDto, req: Request) {
    const {
      tripDate,
      vehicleId,
      currentMeterReading,
      requisitionerPurpose,
      eLog,
    } = body;

    const driver = req.user as RequestedUser;
    const {
      POSONumber,
      startTime,
      endTime,
      stationaryRunningTime,
      totalDistance,
      fuelReceived,
      fuelType,
      remarks,
    } = eLog;

    const validVehicle = await this.vehicleService.validateVehicleForTrip(
      driver,
      vehicleId,
    );

    if (!validVehicle.valid) {
      throw new BadRequestException(validVehicle.message);
    }

    const BOSData = await this.database.bocTrip.create({
      data: {
        tripDate,
        currentMeterReading,
        requisitionerPurpose,
        vehicle: {
          connect: {
            id: vehicleId,
          },
        },
        driver: {
          connect: {
            id: driver.id,
          },
        },
        eLog: {
          create: {
            POSONumber,
            startTime,
            endTime,
            stationaryRunningTime,
            totalDistance,
            fuelReceived,
            fuelType,
            remarks,
            meterReading: currentMeterReading,
          },
        },
      },
    });
    if (BOSData) {
      const auditLogDate = moment(BOSData.createdAt).format('DD/MM/YYYY hh:mm');

      await this.auditLogService.create({
        addedBy: driver.id,
        currentRole: driver.roles.includes('PRE_APPROVED_DRIVER')
          ? 'PRE_APPROVED_DRIVER'
          : 'DRIVER',
        description: `${auditLogDate} BOs-AOS-POL Trip "${BOSData.id}" has been CREATED by User (${driver.name})!`,
        name: driver.name,
      });
    }
    delete BOSData.deleted;
    return BOSData;
  }

  async findAll() {
    const BOSData = await this.database.bocTrip.findMany();
    if (!BOSData) return [];
    return BOSData;
  }

  async findMany(query: FindManyBosAosPolDto) {
    const {
      limit,
      offset = 0,
      searchValue,
      driverName,
      vehicleNumber,
      tripDate,
      ...additionQuery
    } = query;

    const findingQuery: any = {
      ...additionQuery,
    };

    if (tripDate) {
      findingQuery.AND = [
        {
          tripDate: {
            gte: moment(tripDate).startOf('day').toDate(),
            lte: moment(tripDate).endOf('day').toDate(),
          },
        },
      ];
    }

    if (driverName) {
      findingQuery.driver = {
        name: driverName,
      };
    }

    if (vehicleNumber) {
      findingQuery.vehicle = {
        vehicleNumber,
      };
    }

    if (searchValue) {
      findingQuery.OR = [
        {
          requisitionerPurpose: { contains: searchValue, mode: 'insensitive' },
        },
        {
          vehicle: {
            vehicleNumber: { contains: searchValue, mode: 'insensitive' },
          },
        },
        {
          driver: {
            name: { contains: searchValue, mode: 'insensitive' },
          },
        },
      ];
    }

    const [count, records] = await Promise.all([
      this.database.bocTrip.count({
        where: {
          deleted: false,
          ...findingQuery,
        },
      }),
      this.database.bocTrip.findMany({
        take: limit,
        skip: offset,
        where: {
          deleted: false,
          ...findingQuery,
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
      count,
      records,
    };
  }

  async findOne(id: number) {
    const BOSData = await this.database.bocTrip.findFirst({
      where: {
        id: id,
      },
    });

    if (!BOSData) return {};
    return BOSData;
  }

  async update(id: number, data: any) {
    const trip = await this.database.bocTrip.findFirst({
      where: {
        id,
        deleted: false,
        eLogId: {
          not: undefined,
        },
        eLog: {
          deleted: false,
          endTime: {
            not: null,
          },
        },
      },
      include: {
        eLog: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            fuelReceived: true,
            fuelType: true,
            meterReading: true,
          },
        },
      },
    });

    if (!trip) {
      throw new Error('Trip not found!');
    }

    if (!trip.vehicleId) {
      throw new Error('Trip not assigned to a vehicle!');
    }

    const currentElog = trip.eLog;

    if (!currentElog.endTime)
      throw new Error('It looks like trip is not ended yet!');

    const previousTrip = await this.database.bocTrip.findFirst({
      where: {
        deleted: false,
        tripDate: {
          lt: trip.tripDate,
        },
        vehicle: {
          id: trip.vehicleId,
          deleted: false,
        },
      },
      include: {
        eLog: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            fuelReceived: true,
            fuelType: true,
            meterReading: true,
          },
        },
      },
    });

    const nextTrip = await this.database.bocTrip.findFirst({
      where: {
        deleted: false,
        tripDate: {
          gt: trip.tripDate,
        },
        vehicle: {
          id: trip.vehicleId,
          deleted: false,
        },
      },
      include: {
        eLog: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            fuelReceived: true,
            fuelType: true,
            meterReading: true,
          },
        },
      },
    });

    const updatedData = {
      ...data,

      startTime: moment
        .utc(currentElog.startTime)
        .set('hours', moment.utc(data.startTime).get('hours'))
        .set('minutes', moment.utc(data.startTime).get('minutes'))
        .toISOString(),
      endTime: moment
        .utc(currentElog.endTime)
        .set('hours', moment.utc(data.endTime).get('hours'))
        .set('minutes', moment.utc(data.endTime).get('minutes'))
        .toISOString(),
      tripDate: moment
        .utc(data.tripDate)
        //        .add(1, "days")
        .set('hours', trip.tripDate.getUTCHours())
        .set('minutes', trip.tripDate.getUTCMinutes())
        .set('seconds', trip.tripDate.getUTCSeconds())
        .set('milliseconds', trip.tripDate.getUTCMilliseconds())
        .toISOString(),
    };

    const isMeterReadingChanged =
      currentElog.meterReading !== data.meterReading;
    const isStartTimeChanged = !moment(currentElog.startTime).isSame(
      updatedData.startTime,
    );
    const isEndTimeChanged = !moment(currentElog.endTime).isSame(
      updatedData.endTime,
    );
    // const isTripDateChanged = !moment(trip.tripDate).isSame(
    //   updatedData.tripDate,
    // );
    const isFuelRecievedChanged =
      currentElog.fuelReceived !== data.fuelRecieved;
    const isFuelTypeChanged = currentElog.fuelType !== data.fuelType;
    const isTripDateChanged = !moment(trip.tripDate).isSame(data.tripDate);
    if (
      !isMeterReadingChanged &&
      !isStartTimeChanged &&
      !isEndTimeChanged &&
      !isTripDateChanged &&
      !isFuelRecievedChanged &&
      !isFuelTypeChanged
    ) {
      return trip;
    }

    const tripRecordToUpdate = {
      tripDate: trip.tripDate.toISOString(),
    };

    const eLogRecordToUpdate = {
      startTime: currentElog.startTime.toISOString(),
      endTime: currentElog.endTime.toISOString(),
      meterReading: currentElog.meterReading,
      fuelType: updatedData.fuelType ? updatedData.fuelType : null,
      fuelReceived: updatedData.fuelRecieved ? updatedData.fuelRecieved : 0,
    };

    if (isTripDateChanged) {
      /*if (previousTrip) {
        if (
          !nextTrip &&
          moment
            .utc(updatedData.tripDate)
            .isSameOrAfter(previousTrip.tripDate, 'day')
        ) {
          tripRecordToUpdate.tripDate = updatedData.tripDate;
        } else {
          throw new BadRequestException(
            `Trip date cannot be less than previous trip date (${moment(
              previousTrip.tripDate,
            )
              .local()
              .format('DD/MM/YYYY')})!`,
          );
        }
      }

      if (nextTrip) {
        if (
          !previousTrip &&
          moment
            .utc(updatedData.tripDate)
            .isSameOrBefore(nextTrip.tripDate, 'day')
        ) {
          tripRecordToUpdate.tripDate = updatedData.tripDate;
        } else {
          throw new BadRequestException(
            `Trip date cannot be greater than next trip date (${moment(
              nextTrip.tripDate,
            )
              .local()
              .format('DD/MM/YYYY')})!`,
          );
        }
      }

      if (previousTrip && nextTrip) {
        if (
          moment
            .utc(updatedData.tripDate)
            .isBetween(previousTrip.tripDate, nextTrip.tripDate, 'day', '[]')
        ) {
          tripRecordToUpdate.tripDate = updatedData.tripDate;
        } else {
          throw new BadRequestException(
            `Trip date should be between previous trip date (${moment(
              previousTrip.tripDate,
            )
              .local()
              .format('DD/MM/YYYY')}) and next trip date (${moment(
              nextTrip.tripDate,
            )
              .local()
              .format('DD/MM/YYYY')})!`,
          );
        }
      }

      if (!previousTrip && !nextTrip) {
        tripRecordToUpdate.tripDate = updatedData.tripDate;
      }*/
      tripRecordToUpdate.tripDate = updatedData.tripDate;
    }

    if (isStartTimeChanged) {
      // Start time should be less than end time of current trip
      /*console.log('START TIME', updatedData.startTime)
      console.log('END TIME', updatedData.endTime)
      if (
        moment.utc(updatedData.startTime).isSameOrAfter(updatedData.endTime)
      ) {
        throw new Error('Start time should be less than end time!');
      } else {
        eLogRecordToUpdate.startTime = updatedData.startTime;
      }*/
      eLogRecordToUpdate.startTime = updatedData.startTime;
    }

    if (isEndTimeChanged) {
      // End time should be greater than start time of current trip
      /*if (updatedData.endTime <= updatedData.startTime) {
        throw new BadRequestException('End time should be greater than start time!');
      } else {
        eLogRecordToUpdate.endTime = updatedData.endTime;
      }*/
      eLogRecordToUpdate.endTime = updatedData.endTime;
    }

    if (isMeterReadingChanged) {
      // Check if meter reading is less than or equal to previous meter reading then throw an error
      if (previousTrip && !nextTrip) {
        /*if (updatedData.meterReading <= previousTrip.eLog.meterReading) {
          throw new BadRequestException(
            'Meter reading should be greater than previous meter reading!',
          );
        } else {
          eLogRecordToUpdate.meterReading = updatedData.meterReading;
        }*/
        eLogRecordToUpdate.meterReading = updatedData.meterReading;
      }

      // Check if meter reading is greater than or equal to next meter reading then throw an error

      if (nextTrip && !previousTrip) {
        /*if (updatedData.meterReading >= nextTrip.eLog.meterReading) {
          throw new BadRequestException(
            'Meter reading should be less than next meter reading!',
          );
        } else {
          eLogRecordToUpdate.meterReading = updatedData.meterReading;
        }*/
        eLogRecordToUpdate.meterReading = updatedData.meterReading;
      }

      // Check if meter reading is between previous and next meter reading then throw an error
      if (previousTrip && nextTrip) {
        eLogRecordToUpdate.meterReading = updatedData.meterReading;
        /*if (
          updatedData.meterReading > previousTrip.eLog.meterReading &&
          updatedData.meterReading < nextTrip.eLog.meterReading
        ) {
          eLogRecordToUpdate.meterReading = updatedData.meterReading;
        } else {
          throw new BadRequestException(
            `Meter reading should be between previous meter reading (${previousTrip.eLog.meterReading}) and next meter reading (${nextTrip.eLog.meterReading})!`,
          );
        }*/
      }

      if (!previousTrip && !nextTrip) {
        eLogRecordToUpdate.meterReading = updatedData.meterReading;
      }
    }

    return await this.database.bocTrip.update({
      where: {
        id: trip.id,
      },
      data: {
        ...tripRecordToUpdate,
        currentMeterReading: eLogRecordToUpdate.meterReading,
        eLog: {
          update: {
            ...eLogRecordToUpdate,
          },
        },
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} bosAosPol`;
  }

  async getExportData(query: ExportBosAosPolDto) {
    const exportData = await this.database.bocTrip.findMany({
      where: {
        createdAt: buildFindingQueryInRange(query.fromDate, query.toDate),
        deleted: false,
      },
      include: {
        driver: true,
        vehicle: true,
        eLog: true,
      },
      orderBy: {
        tripDate: 'desc',
      },
    });

    if (!exportData?.length) {
      throw new BadRequestException('No Data Found!');
    }

    const mapData = exportData.map((data) => ({
      Id: data.id,
      Vehicle_Number: data?.vehicle?.vehicleNumber ?? 'N/A',
      Trip_Date: data?.tripDate
        ? moment.utc(data?.tripDate).local().format('DD MMM, YYYY')
        : 'N/A',
      Requisitioner_Purpose: data?.requisitionerPurpose ?? 'N/A',
      Start_Time: data?.eLog?.startTime
        ? moment.utc(data.eLog.startTime).local().format('HH:mm')
        : 'N/A',
      End_Time: data?.eLog?.endTime
        ? moment.utc(data.eLog.endTime).local().format('HH:mm')
        : 'N/A',
      Current_Meter_Reading: data?.currentMeterReading ?? 'N/A',
      // Stationary_Running_Time: data?.eLog?.stationaryRunningTime ?? "N/A",
      End_Meter_Reading: data?.eLog?.meterReading ?? 'N/A',
      Fuel_Received: data?.eLog?.fuelReceived ?? 'N/A',
      Fuel_Type: (data?.eLog?.fuelType as string) ?? 'N/A',
      Driver_Name: data?.driver?.name ?? 'N/A',
    }));

    return mapData;
  }

  async getDetails(id: number) {
    return await this.database.bocTrip.findFirst({
      where: { id },
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
    });
  }

  async deleteBos(id: number) {
    try {
      return await this.database.bocTrip.delete({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new Error('Something went wrong!');
    }
  }
}
