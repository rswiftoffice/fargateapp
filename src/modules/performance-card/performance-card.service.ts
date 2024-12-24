import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/core/database/database.service';
import { Request } from 'express';
import { RequestedUser } from '../users/entities/user.entity';
import { DownloadPerformanceCardDTO } from './dto/performance-card.dto';
import * as moment from 'moment';
import { Parser } from 'json2csv';

@Injectable()
export class PerformanceCardService {
  constructor(private database: DatabaseService) {}
  async findAllPerformanceCards(req: Request) {
    const user = req.user as RequestedUser;

    const userLicenceClasses = await this.database.licenseClass.findMany({
      where: {
        deleted: false,
        users: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (!userLicenceClasses.length)
      throw new BadRequestException('No license classes attached to the user.');

    const performanceCard = [];

    await Promise.all(
      userLicenceClasses.map(async (licenseClass) => {
        const totalDistance = await this.database.eLog.aggregate({
          _sum: {
            totalDistance: true,
          },
          where: {
            bocTrip: null,
            deleted: false,
            destination: {
              deleted: false,
              trip: {
                deleted: false,
                driver: {
                  id: user.id,
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
              },
            },
          },
        });

        performanceCard.push({
          licenseClass: {
            id: licenseClass.id,
            class: licenseClass.class,
          },
          totalDistanceCovered: totalDistance._sum.totalDistance,
        });
      }),
    );

    return performanceCard;
  }

  async download(body: DownloadPerformanceCardDTO, req: Request) {
    const user = req.user as RequestedUser;
    try {
      const { endDate, startDate, verifiedBy } = body;

      // Fix submitted date time convert while querying (lost 1 day from request)
      const startDateParam = moment(startDate)
        .add(1, 'day')
        .format('YYYY-MM-DD 00:00:00');
      const endDateParam = moment(endDate)
        .add(1, 'day')
        .format('YYYY-MM-DD 23:59:00');

      const userLicenceClasses = await this.database.licenseClass.findMany({
        where: {
          deleted: false,
          users: {
            some: {
              id: user.id,
            },
          },
        },
        orderBy: {
          class: 'asc',
        },
      });

      if (!userLicenceClasses.length) {
        // throw new BadRequestException(
        //   'No license classes attached to the user.',
        // );
        return 'No license classes attached to the user.';
      }

      const performanceCard = [];
      let sn = 1;
      const calculations = {};
      userLicenceClasses.forEach((c) => (calculations[c.class] = 0));

      await Promise.all(
        userLicenceClasses.map(async (licenseClass) => {
          const trips = await this.database.trip.findMany({
            where: {
              deleted: false,
              driver: {
                id: user.id,
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
              tripDate: {
                gte: new Date(startDateParam),
                lte: new Date(endDateParam),
              },
            },
            include: {
              vehicle: true,
            },
          });

          await Promise.all(
            trips.map(async (trip) => {
              const destinations = await this.database.destination.findMany({
                where: {
                  deleted: false,
                  tripId: trip.id,
                },
                orderBy: {
                  id: 'desc',
                },
              });
              if (destinations.length) {
                for (const destination of destinations) {
                  const eLogs = await this.database.eLog.findMany({
                    where: {
                      deleted: false,
                      destinationId: destination.id,
                    },
                  });

                  if (eLogs.length) {
                    for (const eLog of eLogs) {
                      const totalDistance =
                        eLog.meterReading - trip.currentMeterReading;

                      const classesObj = {};

                      userLicenceClasses.forEach((c) => {
                        classesObj[`Class ${c.class} (Km)`] =
                          licenseClass.id === c.id ? totalDistance : '-';
                      });

                      calculations[licenseClass.class] += totalDistance;

                      performanceCard.push({
                        SN: sn++,
                        DateTimeStamp: parseInt(
                          moment(trip.tripDate).format('YYYYMMDD'),
                          10,
                        ),
                        Date: moment(trip.tripDate).format('LL'),
                        'Vehicle Number': trip.vehicle.vehicleNumber,
                        'Odometer Start': trip.currentMeterReading,
                        'Odometer End': eLog.meterReading,
                        ...classesObj,
                        // "Approving Officer Name": t.approvingOfficer.name,
                        'Verified By': verifiedBy,
                      });
                    }
                  }
                }
              }
            }),
          );
        }),
      );

      if (performanceCard) {
        performanceCard.sort((a, b) => a.DateTimeStamp - b.DateTimeStamp);
        performanceCard.forEach((item, index) => {
          delete performanceCard[index].DateTimeStamp;
          performanceCard[index].SN = index + 1;
        });
      }

      let totalMilage = 0;

      const allTrips = await this.database.trip.findMany({
        where: {
          deleted: false,
          driver: {
            id: user.id,
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
          tripDate: {
            gte: new Date(startDateParam),
            lte: new Date(endDateParam),
          },
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

          if (lastDestination.eLog) {
            totalMilage +=
              lastDestination.eLog.meterReading - t.currentMeterReading;
          }
        }),
      );

      if (!performanceCard.length) {
        return 'No data found for the selected date range.';
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

"NRIC: ", ,"Rank: ", ,"Name: ${user.name}"
"Month: ${moment(startDate).format('MMMM')}${
        moment(startDate).format('MMMM') !== moment(endDate).format('MMMM')
          ? ' - ' + moment(endDate).format('MMMM')
          : ''
      }", ,"Year: ${moment(startDate).format('YYYY')}${
        moment(startDate).format('YYYY') !== moment(endDate).format('YYYY')
          ? ' - ' + moment(endDate).format('YYYY')
          : ''
      }",

${csv}
,,,,Total,${allCalculations.join(',')}

${calculationsArray}
"Total Mileage For The Month: ${calculationsTotal}"
"Accumulated Mileage Till Date: ${totalMilage}", Checked By:
"No. Of Bonus Taken: "
`;

      return card;
    } catch (err) {
      console.log(err, '=====rrr');
    }
  }
}
