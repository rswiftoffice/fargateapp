import { Role } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { DatabaseService } from 'src/core/database/database.service';
import {
  ExportDriverMileagesDto,
  FindManyDriverMileagesDto,
} from './dto/driver-mileage.dto';
import { Parser } from 'json2csv';
import { buildFindingQueryInRange } from 'src/helpers/build';

@Injectable()
export class DriverMileageService {
  constructor(private readonly database: DatabaseService) {}

  async findMany(query: FindManyDriverMileagesDto) {
    const { limit = 10, offset = 0, searchValue } = query;

    const findingQuery: any = {
      deleted: false,
      roles: {
        some: {
          OR: [
            {
              name: {
                equals: Role.DRIVER,
              },
            },
            {
              name: {
                equals: Role.PRE_APPROVED_DRIVER,
              },
            },
          ],
        },
      },
    };

    if (searchValue) {
      findingQuery.OR = [
        {
          name: {
            contains: searchValue,
            mode: 'insensitive',
          },
        },
        {
          subUnit: {
            name: {
              contains: searchValue,
              mode: 'insensitive',
            },
          },
        },
        {
          subUnit: {
            base: {
              name: {
                contains: searchValue,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          subUnit: {
            base: {
              command: {
                name: {
                  contains: searchValue,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
        {
          subUnit: {
            base: {
              command: {
                service: {
                  name: {
                    contains: searchValue,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        },
      ];
    }

    const [count, records] = await Promise.all([
      this.database.user.count({
        where: findingQuery,
      }),
      this.database.user.findMany({
        take: limit,
        skip: offset,
        where: findingQuery,
        include: {
          licenseClasses: true,
          roles: true,
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
        orderBy: {
          id: 'asc',
        },
      }),
    ]);

    return {
      count,
      records,
    };
  }

  async exportCSV(query: ExportDriverMileagesDto) {
    const { driverId, toDate, fromDate, verifiedBy } = query;

    const driver = await this.database.user.findFirst({
      where: {
        id: driverId,
        deleted: false,
        AND: {
          roles: {
            some: {
              OR: [
                {
                  name: {
                    equals: Role.DRIVER,
                  },
                },
                {
                  name: {
                    equals: Role.PRE_APPROVED_DRIVER,
                  },
                },
              ],
            },
          },
        },
      },
    });

    if (!driver) {
      return {
        code: 0,
        message: 'Driver not found',
      };
    }

    const userLicenceClasses = await this.database.licenseClass.findMany({
      where: {
        deleted: false,
        users: {
          some: {
            id: driverId,
          },
        },
      },
    });

    if (!userLicenceClasses.length)
      return {
        code: 0,
        message: 'No license classes attached to the driver.',
      };

    const performanceCard: any = [];
    let sn = 1;
    const calculations = {};
    userLicenceClasses.forEach((c) => (calculations[c.class] = 0));

    await Promise.all(
      userLicenceClasses.map(async (licenseClass) => {
        const trips = await this.database.trip.findMany({
          where: {
            deleted: false,
            driver: {
              id: driverId,
            },
            vehicle: {
              deleted: false,
              platforms: {
                deleted: false,
                licenseClass: {
                  id: licenseClass.id,
                },
              },
            },
            tripDate: buildFindingQueryInRange(fromDate, toDate),
          },
          include: {
            vehicle: true,
          },
        });

        await Promise.all(
          trips.map(async (trip) => {
            const lastDestination = await this.database.destination.findFirst({
              where: {
                deleted: false,
                tripId: trip.id,
              },
              orderBy: {
                id: 'desc',
              },
            });

            const lastElog = await this.database.eLog.findFirst({
              where: {
                deleted: false,
                destinationId: lastDestination?.id,
              },
            });

            if (lastElog) {
              const totalDistance =
                lastElog.meterReading - trip.currentMeterReading;

              const classesObj = {};

              userLicenceClasses.forEach((c) => {
                classesObj[`Class ${c.class} (Km)`] =
                  licenseClass.id === c.id ? totalDistance : '-';
              });

              calculations[licenseClass.class] += totalDistance;

              performanceCard.push({
                SN: sn++,
                Date: moment(trip.tripDate).format('LL'),
                'Vehicle Number': trip.vehicle.vehicleNumber,
                'Odometer Start': trip.currentMeterReading,
                'Odometer End': lastElog.meterReading,
                ...classesObj,
                'Verified By': verifiedBy,
              });
            }
          }),
        );
      }),
    );

    let totalMilage = 0;

    const allTrips = await this.database.trip.findMany({
      where: {
        deleted: false,
        driver: {
          id: driverId,
        },
        destinations: {
          some: {
            deleted: false,
            status: 'Completed',
            eLog: {
              deleted: false,
              endTime: {
                not: null,
              },
            },
          },
        },
        tripDate: buildFindingQueryInRange(fromDate, toDate),
      },
    });

    await Promise.all(
      allTrips.map(async (t) => {
        const lastDestination = await this.database.destination.findFirst({
          where: {
            deleted: false,
            tripId: t.id,
          },
          orderBy: {
            id: 'desc',
          },
          include: {
            eLog: true,
          },
        });

        if (lastDestination?.eLog) {
          totalMilage +=
            lastDestination.eLog.meterReading - t.currentMeterReading;
        }
      }),
    );

    if (!performanceCard.length) {
      return {
        code: 0,
        message: 'No data found for the selected date range.'
      };
    }

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(performanceCard);

    const allCalculations = Object.keys(calculations).map(
      (c) => calculations[c],
    );

    const calculationsTotal = allCalculations.reduce(
      (total, val) => (total += val),
      0,
    );

    const calculationsArray = Object.keys(calculations)
      .map((cal) => {
        return `Total Mileage On Class ${cal} Vehicles: ${calculations[cal]}`;
      })
      .join('\n');

    const card = `"Transport Operator Performance Card"
"NRIC: ", ,"Rank: ", ,"Name: ${driver.name}"
"Month: ${moment(fromDate).format('MMMM')}${
      moment(toDate).format('MMMM') !== moment(toDate).format('MMMM')
        ? ' - ' + moment(toDate).format('MMMM')
        : ''
    }", ,"Year: ${moment(fromDate).format('YYYY')}${
      moment(toDate).format('YYYY') !== moment(toDate).format('YYYY')
        ? ' - ' + moment(toDate).format('YYYY')
        : ''
    }",
${csv}
,,,,Total,${allCalculations.join(',')}
${calculationsArray}
"Total Mileage For The Month: ${calculationsTotal}"
"Accumulated Mileage Till Date: ${totalMilage}", Checked By:
"No. Of Bonus Taken: "
`;

    return {
      code: 1,
      csv: card,
    };
  }
}
