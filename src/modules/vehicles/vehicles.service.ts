import {
  DestinationStatus,
  Role,
  SubUnit,
  TripStatus,
  User,
} from '.prisma/client';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from 'src/core/database/database.service';
import {
  CreateVehiclesDto,
  FindManyVehiclesQueryDto,
  MakeVehicleAvailableDto,
  TransferVehicleDto,
  UpdateVehicleDto,
} from './dto/vehicles.dto';
import * as _ from 'lodash';
import { VehicleLastMeterReading } from './types/VehicleLastMeterReading.type';

@Injectable()
export class VehicleService {
  constructor(private database: DatabaseService) {}

  async createVehicle(data: CreateVehiclesDto) {
    const { subUnitId, platformId, ...creatingData } = data;
    const existingVehicle = await this.database.vehicle.findFirst({
      where: {
        deleted: false,
        vehicleNumber: {
          contains: data.vehicleNumber,
          mode: 'insensitive',
        },
      },
    });

    if (existingVehicle) {
      throw new BadRequestException(
        `An already existing vehicle has the same Vehicle number (${data.vehicleNumber})`,
      );
    }

    const [subUnit, vehiclePlatform] = await Promise.all([
      this.database.subUnit.findFirst({
        where: {
          id: subUnitId,
          deleted: false,
        },
      }),
      this.database.vehiclesPlatforms.findFirst({
        where: {
          id: platformId,
          deleted: false,
        },
      }),
    ]);

    if (!subUnit) {
      throw new BadRequestException(`Sub unit not found with id: ${subUnitId}`);
    }

    if (!vehiclePlatform) {
      throw new BadRequestException(
        `Vehicle platform not found with id: ${platformId}`,
      );
    }

    const vehicle = await this.database.vehicle.create({
      data: {
        ...creatingData,
        subUnit: {
          connect: {
            id: subUnitId,
          },
        },
        platforms: {
          connect: {
            id: platformId,
          },
        },
      },
    });

    return vehicle;
  }

  async updateVehicle(data: UpdateVehicleDto) {
    const vehicle = await this.database.vehicle.findFirst({
      where: {
        id: data.id,
        deleted: false,
      },
    });

    if (!vehicle) {
      throw new BadRequestException(`Vehicle not found with id: ${data.id}`);
    }

    const existingVehicle = await this.database.vehicle.findFirst({
      where: {
        vehicleNumber: {
          contains: data.vehicleNumber,
          mode: 'insensitive',
        },
        deleted: false,
        NOT: {
          id: data.id,
        },
      },
    });

    if (existingVehicle) {
      throw new BadRequestException(
        `An already existing vehicle has the same Vehicle number (${data.vehicleNumber})`,
      );
    }

    const updatedVehicle = await this.database.vehicle.update({
      where: {
        id: data.id,
      },
      data: {
        vehicleNumber: data.vehicleNumber,
        model: data.model,
        isServiceable: data.isServiceable,
        vehicleType: data.vehicleType,
        subUnit: {
          connect: {
            id: data.subUnitId,
          },
        },
        platforms: {
          connect: {
            id: data.platformId,
          },
        },
      },
    });

    return updatedVehicle;
  }

  async findtripIdElogs(findtripIdElogs) {
    console.log(findtripIdElogs);

    const eLogs = await this.database.eLog.findMany({
      where: {
        destinationId: findtripIdElogs,
        deleted: false,
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
      }) => {
        return {
          id,
          startTime,
          endTime,
          stationaryRunningTime,
          meterReading,
          totalDistance,
        };
      },
    );
    return reStructuredElog;
  }
  async deleteVehicle(id: number) {
    const vehicle = await this.database.vehicle.findFirst({
      where: {
        id,
        deleted: false,
      },
    });

    if (!vehicle) {
      throw new BadRequestException(`Vehicle not found with id: ${id}`);
    }

    const deletedObject = await this.database.$transaction([
      this.database.vehicle.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
      }),
      this.database.vehicleServicing.updateMany({
        where: {
          vehicle: {
            id,
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.updates.updateMany({
        where: {
          vehicleServicing: {
            vehicle: {
              id,
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.checkIn.updateMany({
        where: {
          vehicleServicing: {
            vehicle: {
              id,
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.basicIssueTools.updateMany({
        where: {
          OR: [
            {
              checkIn: {
                vehicleServicing: {
                  vehicle: {
                    id,
                  },
                },
              },
            },
            {
              checkOut: {
                vehicleServicing: {
                  vehicle: {
                    id,
                  },
                },
              },
            },
          ],
        },
        data: {
          deleted: true,
        },
      }),
      this.database.preventiveMaintenanceCheckIn.updateMany({
        where: {
          checkIn: {
            vehicleServicing: {
              vehicle: {
                id,
              },
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.correctiveMaintenanceCheckIn.updateMany({
        where: {
          checkIn: {
            vehicleServicing: {
              vehicle: {
                id,
              },
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.annualVehicleInspectionCheckIn.updateMany({
        where: {
          checkIn: {
            vehicleServicing: {
              vehicle: {
                id,
              },
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.checkOut.updateMany({
        where: {
          vehicleServicing: {
            vehicle: {
              id,
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.preventiveMaintenanceCheckOut.updateMany({
        where: {
          checkOut: {
            vehicleServicing: {
              vehicle: {
                id,
              },
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.annualVehicleInspectionCheckOut.updateMany({
        where: {
          checkOut: {
            vehicleServicing: {
              vehicle: {
                id,
              },
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
    ]);
    if (deletedObject?.length) return deletedObject[0];
    return null;
  }

  async transferVehicle(data: TransferVehicleDto) {
    const [currentVehicle, newVehicle] = await Promise.all([
      this.database.vehicle.findFirst({
        where: {
          id: data.currentVehicleId,
          deleted: false,
        },
        select: {
          trips: {
            select: {
              id: true,
            },
          },
          bocTrips: {
            select: {
              id: true,
            },
          },
          vehicleServicing: {
            select: {
              id: true,
            },
          },
        },
      }),
      this.database.vehicle.findFirst({
        where: {
          id: data.newVehicleId,
        },
      }),
    ]);

    if (!currentVehicle)
      throw new BadRequestException(
        `Vehicle not found with id ${data.currentVehicleId}`,
      );
    if (!newVehicle)
      throw new BadRequestException(
        `Vehicle not found with id ${data.newVehicleId}`,
      );

    const { trips, bocTrips, vehicleServicing } = currentVehicle;

    await this.database.$transaction([
      this.database.trip.updateMany({
        where: {
          id: {
            in: trips.map((trip) => trip.id),
          },
        },
        data: {
          vehiclesId: data.newVehicleId,
        },
      }),
      this.database.bocTrip.updateMany({
        where: {
          id: {
            in: bocTrips.map((trip) => trip.id),
          },
        },
        data: {
          vehicleId: data.newVehicleId,
        },
      }),
      this.database.vehicleServicing.updateMany({
        where: {
          id: {
            in: vehicleServicing.map((servicing) => servicing.id),
          },
        },
        data: {
          vehicleId: data.newVehicleId,
        },
      }),
      this.database.vehicle.update({
        where: {
          id: data.currentVehicleId,
        },
        data: {
          deleted: true,
        },
      }),
    ]);

    return newVehicle;
  }

  async makeVehicleAvailable(data: MakeVehicleAvailableDto) {
    const { tripId, hasNoInProgressDestinations } = data;

    if (hasNoInProgressDestinations) {
      const payload = {
        tripStatus: TripStatus.Completed,
        endedAt: data.endedAt,
      };
      if (data.meterReading) {
        payload['currentMeterReading'] = data.meterReading;
      }

      let destination = await this.database.destination.findFirst({
        where: {
          tripId,
          status: DestinationStatus.InProgress,
          deleted: false,
        },
      });
      if (destination === null) {
        destination = await this.database.destination.findFirst({
          where: {
            tripId,
            // status: DestinationStatus.InProgress,
            deleted: false,
          },
        });
      }
      const eLog = await this.database.eLog.findFirst({
        where: {
          destinationId: destination.id,
        },
      });

      const destinations = await this.database.destination.findMany({
        where: {
          tripId: tripId, // Replace with your actual tripId
          status: DestinationStatus.InProgress,
        },
        select: {
          id: true,
        },
      });

      const destinationIds = destinations.map((destination) => destination.id);

      // Step 3: Update the eLog table based on the retrieved destination id(s)
      const updatedELogs = await this.database.eLog.updateMany({
        where: {
          destinationId: {
            in: destinationIds,
          },
        },
        data: {
          // Update the fields as needed
          meterReading: data.meterReading,
          endTime: new Date().toISOString(),
        },
      });
      await this.database.destination.updateMany({
        where: {
          tripId: tripId, // Replace with your actual tripId
        },
        data: {
          status: DestinationStatus.Completed,
        },
      });

      if (eLog) {
        console.log(eLog, '===eLog', data);
        const updateElog = await this.database.eLog.update({
          where: {
            destinationId: destination.id,
          },
          data: {
            meterReading: data.meterReading,
            endTime: data.endTime + ':00Z',
            stationaryRunningTime: data.stationaryRunningTime,
            totalDistance: data.totalDistance,
            fuelReceived: data.fuelReceived,
            POSONumber: data.poSoNumber,
            fuelType: data.fuelType,
            requisitionerPurpose: data.requisitionerPurpose,
            remarks: data.remarks,
          },
        });
      }
      await this.database.trip.update({
        where: {
          id: tripId,
        },
        data: payload,
      });

      return true;
    }

    const nextDestinations = await this.database.destination.findMany({
      where: {
        tripId,
        status: {
          in: [DestinationStatus.Inactive, DestinationStatus.Review],
        },
        deleted: false,
      },
    });

    const destination = await this.database.destination.findFirst({
      where: {
        tripId,
        // status: DestinationStatus.InProgress,
        deleted: false,
      },
    });
    const eLog = await this.database.eLog.findFirst({
      where: {
        destinationId: destination.id,
      },
    });

    if (eLog) {
      const updateElog = await this.database.eLog.update({
        where: {
          destinationId: destination.id,
        },
        data: {
          meterReading: data.meterReading,
          endTime: data.endTime + ':00Z',
          stationaryRunningTime: data.stationaryRunningTime,
          totalDistance: data.totalDistance,
          fuelReceived: data.fuelReceived,
          POSONumber: data.poSoNumber,
          fuelType: data.fuelType,
          requisitionerPurpose: data.requisitionerPurpose,
          remarks: data.remarks,
        },
      });
      console.log(updateElog, '===updateElog');
    }

    if (!destination) {
      throw new BadRequestException('Destination not found!');
    }

    await this.database.$transaction([
      this.database.destination.update({
        where: {
          id: destination.id,
        },
        data: {
          status: DestinationStatus.Completed,
          details: data.details,
          eLog: {
            update: {
              meterReading: data.meterReading,
              endTime: data.endTime + ':00Z',
              stationaryRunningTime: data.stationaryRunningTime,
              totalDistance: data.totalDistance,
              fuelReceived: data.fuelReceived,
              POSONumber: data.poSoNumber,
              fuelType: data.fuelType,
              requisitionerPurpose: data.requisitionerPurpose,
              remarks: data.remarks,
            },
          },
        },
      }),

      this.database.destination.updateMany({
        where: {
          id: {
            in: nextDestinations.map((destination) => destination.id),
          },
        },
        data: {
          status: DestinationStatus.Cancelled,
        },
      }),
      this.database.trip.update({
        where: {
          id: tripId,
        },
        data: {
          tripStatus: TripStatus.Completed,
          endedAt: data.endedAt,
        },
      }),
    ]);

    return true;
  }

  async findAllVehicles() {
    const [vehicles] = await Promise.all([
      this.database.vehicle.findMany({
        where: {
          deleted: false,
        },
        include: {
          platforms: true,
          subUnit: true,
        },
        orderBy: {
          id: 'asc',
        },
      }),
    ]);

    return {
      records: vehicles,
    };
  }

  async findManyVehicles(query: FindManyVehiclesQueryDto) {
    const { limit = 10, offset = 0, searchValue } = query;

    const findingQuery: any = {};

    if (searchValue) {
      findingQuery.OR = [
        {
          vehicleNumber: { contains: searchValue, mode: 'insensitive' },
        },
        {
          model: { contains: searchValue, mode: 'insensitive' },
        },
        {
          subUnit: {
            name: { contains: searchValue, mode: 'insensitive' },
          },
        },
        {
          platforms: {
            name: { contains: searchValue, mode: 'insensitive' },
          },
        },
      ];
    }
    const [count, vehicles] = await Promise.all([
      this.database.vehicle.count({
        where: {
          deleted: false,
          ...findingQuery,
        },
      }),
      this.database.vehicle.findMany({
        take: Number(limit),
        skip: Number(offset),
        where: {
          deleted: false,
          ...findingQuery,
        },
        include: {
          platforms: true,
          subUnit: true,
        },
        orderBy: {
          id: 'asc',
        },
      }),
    ]);

    const expectedVehicles = await Promise.all(
      vehicles.map(async (vehicle) => {
        const trip = await this.database.trip.findFirst({
          where: {
            deleted: false,
            vehiclesId: vehicle.id,
            tripStatus: 'InProgress',
          },
        });
        return {
          ...vehicle,
          currentTrip: trip,
        };
      }),
    );

    return {
      records: expectedVehicles,
      count,
    };
  }

  async findOneForAdmin(id: number) {
    const vehicle = await this.database.vehicle.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        platforms: true,

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
    });

    if (!vehicle)
      throw new NotFoundException(`Vehicle with id ${id} doesn't exist!`);

    const trip = await this.database.trip.findFirst({
      where: {
        deleted: false,
        vehiclesId: vehicle.id,
        tripStatus: 'InProgress',
      },
      include: {
        destinations: {
          where: {
            status: {
              in: [
                DestinationStatus.Inactive,
                DestinationStatus.Completed,
                DestinationStatus.InProgress,
              ],
            },
          },
        },
      },
    });

    const tripIsCompleted = await this.database.trip.findFirst({
      where: {
        deleted: false,
        vehiclesId: vehicle.id,
        tripStatus: 'InProgress',
      },
      include: {
        destinations: {
          where: {
            status: {
              in: [DestinationStatus.Completed],
            },
          },
          orderBy: {
            id: 'desc',
          },
        },
      },
    });
    if (
      tripIsCompleted?.destinations !== null &&
      tripIsCompleted?.destinations?.length > 0
    ) {
      const eLogData = await this.database.eLog.findFirst({
        where: {
          deleted: false,
          destinationId: tripIsCompleted.destinations[0].id,
        },
      });
      return {
        ...vehicle,
        currentTrip: trip,
        eLog: eLogData,
      };
    } else {
      return {
        ...vehicle,
        currentTrip: trip,
        eLog: {},
      };
    }
  }

  async findOne(req: Request, id: number) {
    const user = req.user as any;

    const vehicle = await this.database.vehicle.findFirst({
      where: {
        id,
        platforms: {
          licenseClass: {
            users: {
              some: {
                id: user.id,
                deleted: false,
              },
            },
          },
        },
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
        // NOT: {
        //   trips: {
        //     some: {
        //       tripStatus: TripStatus.InProgress,
        //     },
        //   },
        // },
        deleted: false,
      },
    });
    if (!vehicle)
      throw new BadRequestException(
        `vehicle not exist by id:${id} or you are not authorized to get this vehicle data.`,
      );
    delete vehicle.deleted;
    return vehicle;
  }

  async findByNumber(req: Request, vehicleNumber?: string) {
    const user = req.user as User & {
      roles: string[];
      subUnit: SubUnit;
    };
    const hasDriverRole = user.roles.includes('DRIVER');

    if (!hasDriverRole) {
      throw new BadRequestException('User does not have the DRIVER role!');
    }

    if (!vehicleNumber || vehicleNumber.length < 2) {
      throw new BadRequestException(
        'Vehicle number must have at least 2 digits!',
      );
    }

    const vehicles = await this.database.vehicle.findMany({
      where: {
        vehicleNumber: {
          contains: vehicleNumber,
        },
        deleted: false,
        subUnit: {
          deleted: false,
          base: {
            deleted: false,
            id: user.subUnit.baseId,
          },
        },
      },
      include: {
        platforms: true,
        subUnit: {
          include: {
            base: true,
          },
        },
      },
    });

    return _.map(vehicles, (vehicle) =>
      _.omit(vehicle, ['deleted', 'createdAt', 'updatedAt']),
    );
  }

  async validateVehicleForTrip(driver: any, vehicleId: number) {
    if (!driver.subUnitId) {
      return {
        message: `Driver is missing sub unit!`,
        valid: false,
      };
    }
    const vehicle = await this.database.vehicle.findFirst({
      where: {
        id: vehicleId,
        deleted: false,
        ...(driver.hasBaseLevelVehiclesAccess
          ? {
              subUnit: {
                deleted: false,
                base: {
                  deleted: false,
                  id: driver.subUnit.baseId,
                },
              },
            }
          : {
              subUnit: {
                id: driver.subUnitId,
                deleted: false,
              },
            }),
        // NOT: {
        //   trips: {
        //     some: {
        //       tripStatus: TripStatus.InProgress,
        //     },
        //   },
        // },
      },
    });

    if (!vehicle) {
      return {
        message: `Either driver doesn't have access to vehicle ${vehicleId} or the vehicle is already busy in another trip!`,
        valid: false,
      };
    }

    return {
      message: `Vehicle is available for trip!`,
      valid: true,
    };
  }
  async validateAvailablityForDestination(
    driver: any,
    vehicleId: number,
    tripId: number,
  ) {
    if (!driver.subUnitId) {
      return {
        message: `Either vehicle doesn't exist in SubUnit id ${driver.subUnitId}!`,
        valid: false,
      };
    }
    const vehicle = await this.database.vehicle.findMany({
      where: {
        id: vehicleId,
        deleted: false,

        NOT: {
          trips: {
            some: {
              tripStatus: TripStatus.InProgress,
              NOT: {
                id: tripId,
              },
            },
          },
        },
      },
    });

    if (vehicle.length === 0) {
      return {
        message: `Vehicle is already busy in another trip!`,
        valid: false,
      };
    }
    return {
      message: `valid vehicle`,
      valid: true,
    };
  }
  async validateVehicleForTripWithoutCheckAvailablity(
    driver: any,
    vehicleId: number,
  ) {
    console.log(driver, '===driver');
    if (!driver.subUnitId) {
      return {
        message: `Either vehicle doesn't exist in SubUnit id ${driver.subUnitId}!`,
        valid: false,
      };
    }
    const vehicle = await this.database.vehicle.findMany({
      where: {
        id: vehicleId,
        deleted: false,
        ...(driver.hasBaseLevelVehiclesAccess
          ? {
              subUnit: {
                deleted: false,
                base: {
                  deleted: false,
                  id: driver.subUnit.baseId,
                },
              },
            }
          : {
              subUnit: {
                id: driver.subUnitId,
                deleted: false,
              },
            }),
      },
    });

    if (vehicle.length === 0) {
      return {
        message: `Either vehicle doesn't exist in SubUnit id ${driver.subUnitId}!`,
        valid: false,
      };
    }
    return {
      message: `valid vehicle`,
      valid: true,
    };
  }

  async getLastMeterReading(
    req: Request,
    vehicleId: number,
  ): Promise<VehicleLastMeterReading> {
    const driver = req.user as any;
    const vehicle = await this.database.vehicle.findFirst({
      where: {
        id: vehicleId,
        deleted: false,
        // ...(driver.hasBaseLevelVehiclesAccess
        //   ? {
        //     subUnit: {
        //       deleted: false,
        //       base: {
        //         deleted: false,
        //         id: driver.subUnit.baseId,
        //       },
        //     },
        //   }
        //   : {
        //     subUnit: {
        //       id: driver.subUnitId,
        //       deleted: false,
        //     },
        //   }),
      },
    });

    if (!vehicle) {
      throw new BadRequestException(
        "Vehicle doesn't exist or you are not authorized to access this vehicle data.",
      );
    }

    const lastDestination = await this.database.destination.findFirst({
      //   where: {
      //     deleted: false,
      //     trip: {
      //       vehiclesId: vehicleId,
      //     },
      //     eLog: {
      //       deleted: false,
      //     },
      //   },
      //   orderBy: [
      //     {
      //       trip: {
      //         id: 'desc',
      //       },
      //     },
      //     {
      //       createdAt: 'desc'
      //    }
      //  ],
      //   include: {
      //     eLog: true,
      //    },
      //      where: {
      //   deleted: false,
      //   trip: {
      //     vehiclesId: vehicleId
      //   }
      // },
      // include: {
      //   trip: true
      // },
      // orderBy: {
      //   trip: {
      //     id: 'desc'
      //   }
      where: {
        deleted: false,
        trip: {
          vehiclesId: vehicleId,
        },

        eLog: {
          deleted: false,
        },
      },
      include: {
        trip: true,
        eLog: true,
      },
      orderBy: {
        trip: {
          id: 'desc',
        },
      },
    });

    if (!lastDestination)
      return {
        meterReading: null,
      };
    console.log('lastDestination=>', lastDestination.trip.currentMeterReading);
    return {
      meterReading: lastDestination.trip.currentMeterReading,
    };
  }
}
