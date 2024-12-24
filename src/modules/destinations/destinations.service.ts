import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Destination } from '@prisma/client';
import * as moment from 'moment';
import { DatabaseService } from 'src/core/database/database.service';
import { UpdateOneDTO } from './dto/updateDestination.dto';

@Injectable()
export class DestinationsService {
  constructor(private database: DatabaseService) {}

  async findAll(query) {
    console.log('Hello', query);
    const {
      limit = 10,
      offset = 0,
      searchValue,
      tripDate,
      ...newQuery
    } = query;

    const compileQuery: any = {
      ...newQuery,

      deleted: false,
    };

    if (searchValue) {
      compileQuery.OR = [
        {
          requisitionerPurpose: { contains: searchValue, mode: 'insensitive' },
        },
        {
          to: { contains: searchValue, mode: 'insensitive' },
        },
        {
          trip: {
            vehicle: {
              vehicleNumber: { contains: searchValue },
            },
          },
        },
      ];
    }

    if (tripDate) {
      compileQuery.trip = {
        tripDate: {
          gte: moment(tripDate)
            .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
            .toISOString(),
          lt: moment(tripDate)
            .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
            .add(1, 'd')
            .toISOString(),
        },
      };
    }

    const [commands, count] = await Promise.all([
      this.database.destination.findMany({
        where: compileQuery,
        include: {
          trip: {
            include: {
              driver: true,
              approvingOfficer: true,
              vehicle: true,
            },
          },
          eLog: true,
        },
        orderBy: {
          trip: {
            tripDate: 'desc',
          },
        },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.database.destination.count({
        where: compileQuery,
      }),
    ]);

    const validData = commands?.map((each) => {
      delete each.deleted;

      return each;
    });

    return {
      count,
      records: validData,
    };
  }

  async updateOne(id: number, data: UpdateOneDTO): Promise<Destination> {
    const currentDestination = await this.database.destination.findFirst({
      where: { id, deleted: false },
      include: {
        eLog: true,
        trip: true,
      },
    });

    if (!currentDestination) {
      throw new NotFoundException(`Destination not found!`);
    }

    const currentElog = currentDestination.eLog;
    if (!currentElog) throw new NotFoundException(`Elog not found!`);
    if (!currentElog.endTime)
      throw new Error(`It looks like destination is not ended yet!`);

    const previousDestination = await this.database.destination.findFirst({
      where: {
        id: {
          not: id,
        },
        deleted: false,
        trip: {
          vehiclesId: currentDestination.trip.vehiclesId,
        },
        eLog: {
          deleted: false,
          endTime: {
            lte: currentElog.endTime,
          },
        },
      },
      include: {
        eLog: true,
      },
    });

    const nextDestination = await this.database.destination.findFirst({
      where: {
        id: {
          not: id,
        },
        deleted: false,
        trip: {
          vehiclesId: currentDestination.trip.vehiclesId,
        },
        eLog: {
          deleted: false,
          startTime: {
            gte: currentElog.endTime,
          },
        },
      },
      include: {
        eLog: true,
      },
    });
    const updatedData = {
      ...data,
      startTime: moment
        .utc(data.startTime)
        .set('seconds', currentElog.startTime.getUTCSeconds())
        .set('milliseconds', currentElog.startTime.getUTCMilliseconds())
        .toISOString(),
      endTime: moment
        .utc(data.endTime)
        .set('seconds', currentElog.endTime.getUTCSeconds())
        .set('milliseconds', currentElog.endTime.getUTCMilliseconds())
        .toISOString(),
    };

    const isMeterReadingChanged =
      currentElog.meterReading !== data.meterReading;
    const isTotalDistanceChanged =
      currentElog.totalDistance !== data.totalDistance;
    const isStartTimeChanged = !moment(currentElog.startTime).isSame(
      updatedData.startTime,
    );
    const isEndTimeChanged = !moment(currentElog.endTime).isSame(
      updatedData.endTime,
    );
    const isToChanged = currentDestination.to !== data.to;
    const isTripDateChanged = !moment(currentDestination.trip.tripDate).isSame(
      data.tripDate,
    );
    // console.log(currentDestination.trip.tripDate, data.tripDate, isTripDateChanged, !isTripDateChanged);
    // const isTripDateChanged = !moment(moment(currentDestination.trip.tripDate).format("YYYY-MM-DD")).isSame(moment(data.tripDate).add(1, 'days').format("YYYY-MM-DD"))
    //	console.log(moment(currentDestination.trip.tripDate).format("YYYY-MM-DD"), moment(data.tripDate).add(1, 'days').format("YYYY-MM-DD"), isTripDateChanged);
    if (
      !isMeterReadingChanged &&
      !isStartTimeChanged &&
      !isEndTimeChanged &&
      !isToChanged &&
      !isTotalDistanceChanged &&
      !isTripDateChanged
    ) {
      return currentDestination;
    }

    const tripRecordToUpdate = {
      tripDate: currentDestination.trip.tripDate.toISOString(),
      currentMeterReading: updatedData.meterReading,
    };

    if (isTripDateChanged) {
      /*      const previousTrip = await this.database.bocTrip.findFirst({
              where: {
                deleted: false,
                tripDate: {
                  lt: currentDestination.trip.tripDate,
                },
                vehicle: {
                  id: currentDestination.trip.vehiclesId,
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
                  gt: currentDestination.trip.tripDate,
                },
                vehicle: {
                  id: currentDestination.trip.vehiclesId,
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
            if (previousTrip) {
              if (
                !nextTrip &&
                moment
                  .utc(data.tripDate)
                  .isSameOrAfter(previousTrip.tripDate, 'day')
              ) {
      
                tripRecordToUpdate.tripDate = moment
                  .utc(data.tripDate)
                  .add(1, 'days')
                  .set('hours', currentDestination.trip.tripDate.getUTCHours())
                  .set('minutes', currentDestination.trip.tripDate.getUTCMinutes())
                  .set('seconds', currentDestination.trip.tripDate.getUTCSeconds())
                  .set('milliseconds', currentDestination.trip.tripDate.getUTCMilliseconds())
                  .toISOString();
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
                  .utc(data.tripDate)
                  .isSameOrBefore(nextTrip.tripDate, 'day')
              ) {
                tripRecordToUpdate.tripDate = moment
                  .utc(data.tripDate)
                  .add(1, 'days')
                  .set('hours', currentDestination.trip.tripDate.getUTCHours())
                  .set('minutes', currentDestination.trip.tripDate.getUTCMinutes())
                  .set('seconds', currentDestination.trip.tripDate.getUTCSeconds())
                  .set('milliseconds', currentDestination.trip.tripDate.getUTCMilliseconds())
                  .toISOString()
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
                  .utc(data.tripDate)
                  .isBetween(previousTrip.tripDate, nextTrip.tripDate, 'day', '[]')
              ) {
                tripRecordToUpdate.tripDate = moment
                  .utc(data.tripDate)
                  .add(1, 'days')
                  .set('hours', currentDestination.trip.tripDate.getUTCHours())
                  .set('minutes', currentDestination.trip.tripDate.getUTCMinutes())
                  .set('seconds', currentDestination.trip.tripDate.getUTCSeconds())
                  .set('milliseconds', currentDestination.trip.tripDate.getUTCMilliseconds())
                  .toISOString();
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
              tripRecordToUpdate.tripDate = moment
                .utc(data.tripDate)
                .set('hours', currentDestination.trip.tripDate.getUTCHours())
                .set('minutes', currentDestination.trip.tripDate.getUTCMinutes())
                .set('seconds', currentDestination.trip.tripDate.getUTCSeconds())
                .set('milliseconds', currentDestination.trip.tripDate.getUTCMilliseconds())
                .toISOString();
            }
      */
      // tripRecordToUpdate.tripDate = moment
      //   .utc(data.tripDate)
      //   // .add(1, 'days')
      //   .set('hours', currentDestination.trip.tripDate.getUTCHours())
      //   .set('minutes', currentDestination.trip.tripDate.getUTCMinutes())
      //   .set('seconds', currentDestination.trip.tripDate.getUTCSeconds())
      //   .set('milliseconds', currentDestination.trip.tripDate.getUTCMilliseconds())
      //   .toISOString();
      tripRecordToUpdate.tripDate = moment
        .utc(data.tripDate)
        .set('hours', currentDestination.trip.tripDate.getUTCHours())
        .set('minutes', currentDestination.trip.tripDate.getUTCMinutes())
        .set('seconds', currentDestination.trip.tripDate.getUTCSeconds())
        .set(
          'milliseconds',
          currentDestination.trip.tripDate.getUTCMilliseconds(),
        )
        .toISOString();
    }

    const destinationRecordToUpdate = {
      to: isToChanged ? updatedData.to : currentDestination.to,
    };

    const elogRecordToUpdate = {
      //      meterReading: currentElog.meterReading,
      meterReading: updatedData.meterReading,
      totalDistance: updatedData.totalDistance,
      startTime: updatedData.startTime,
      endTime: updatedData.endTime,
    };

    /*if (isMeterReadingChanged) {
      if (!previousDestination && !nextDestination) {
        elogRecordToUpdate.meterReading = updatedData.meterReading
      }

      if (previousDestination && previousDestination.eLog && !nextDestination) {
        if (updatedData.meterReading >= previousDestination.eLog.meterReading) {
          elogRecordToUpdate.meterReading = updatedData.meterReading
        } else {
          throw new BadRequestException(
            `Meter reading must be greater than or equal to previous destination's meter reading (${previousDestination.eLog.meterReading})!`
          )
        }
      }

      if (nextDestination && nextDestination.eLog && !previousDestination) {
        if (updatedData.meterReading <= nextDestination.eLog.meterReading) {
          elogRecordToUpdate.meterReading = updatedData.meterReading
        } else {
          throw new BadRequestException(
            `Meter reading must be less than or equal to next destination's meter reading (${nextDestination.eLog.meterReading})!`
          )
        }
      }

      if (
        previousDestination &&
        previousDestination.eLog &&
        nextDestination &&
        nextDestination.eLog
      ) {
        if (
          updatedData.meterReading >= previousDestination.eLog.meterReading &&
          updatedData.meterReading <= nextDestination.eLog.meterReading
        ) {
          elogRecordToUpdate.meterReading = updatedData.meterReading
        } else {
          throw new BadRequestException(
            `Meter reading must be greater than or equal to previous destination's meter reading (${previousDestination.eLog.meterReading}) and less than or equal to next destination's meter reading (${nextDestination.eLog.meterReading})!`
          )
        }
      }
    }*/
    // console.log(elogRecordToUpdate);
    const val = await this.database.destination.update({
      where: {
        id,
      },
      data: {
        ...destinationRecordToUpdate,
        trip: {
          update: {
            ...tripRecordToUpdate,
          },
        },
        eLog: {
          update: {
            ...elogRecordToUpdate,
          },
        },
      },
    });

    const yy = await this.database.trip.findFirst({
      where: {
        id: val.tripId,
      },
    });

    return await this.database.destination.update({
      where: {
        id,
      },
      data: {
        ...destinationRecordToUpdate,
        trip: {
          update: {
            ...tripRecordToUpdate,
          },
        },
        eLog: {
          update: {
            ...elogRecordToUpdate,
          },
        },
      },
    });
  }

  async getDetails(id: number): Promise<Destination> {
    const destination = await this.database.destination.findFirst({
      where: {
        id,
      },
      include: {
        trip: {
          include: {
            driver: true,
            approvingOfficer: true,
            vehicle: true,
          },
        },
        eLog: true,
      },
    });

    return destination;
  }
}
