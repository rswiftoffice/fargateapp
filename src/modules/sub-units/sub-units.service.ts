import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { FindManySubUnitsQueryDto, CreateSubUnitDto, UpdateSubUnitDto, TransferSubUnitDto } from './dto/subUnit.dto';

@Injectable()
export class SubUnitsService {
  constructor(
    private database: DatabaseService
  ) {}

  async create(subunit: CreateSubUnitDto) {
    const base = await this.database.base.findFirst({
      where: {
        id: subunit.baseId,
        deleted: false,
      }
    })

    if (!base) {
      throw new BadRequestException(`Base not found with id: ${subunit.baseId}`)
    }

    const subUnitCreated = await this.database.subUnit.create({
      data: subunit,
    });

    if (!subUnitCreated) return null;

    return subUnitCreated;
  }

  async findMany(query: FindManySubUnitsQueryDto) {
    const { limit = 10, offset = 0, searchValue, ...newQuery } = query

    const combinedQuery: any = {
      ...newQuery,
      deleted: false,
    }

    if (searchValue) {
      combinedQuery.OR = [
        {
          name: { contains: searchValue, mode: "insensitive" }
        },
        {
          description: { contains: searchValue, mode: "insensitive" }
        },
        {
          base: {
            name: { contains: searchValue, mode: "insensitive" }
          }
        }
      ]
    }

    const [subunits, count] = await Promise.all([
      this.database.subUnit.findMany({
        where: combinedQuery,
        include: {
          base: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.database.subUnit.count({
        where: combinedQuery,
      })
    ])

    return {
      count,
      records: subunits,
    }
  }

  async findOne(id: number) {
    const subunit = await this.database.subUnit.findFirst({
      where: {
        id: id,
        deleted: false,
      },
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
    });

    if (!subunit) {
      throw new BadRequestException(`Sub unit not found with id: ${id}`)
    }

    return subunit;
  }

  async update(id: number, data: UpdateSubUnitDto) {
    const subunit = await this.database.subUnit.findFirst({
      where: {
        id: id,
        deleted: false,
      },
    });

    if (!subunit) {
      throw new BadRequestException(`Sub unit not found with id: ${id}`)
    }

    if (data.baseId && data.baseId !== subunit.baseId) {
      const base = await this.database.base.findFirst({
        where: {
          id: data.baseId,
          deleted: false,
        }
      })

      if (!base) {
        throw new BadRequestException(`Base not found with id: ${subunit.baseId}`)
      }
    }

    const updatedSubunit = await this.database.subUnit.update({
      where: {
        id: id,
      },
      data,
    });

    return updatedSubunit;
  }

  async transfer(data: TransferSubUnitDto) {
    const [currentSubUnit, newSubUnit] = await Promise.all([
      this.database.subUnit.findFirst({
        where: {
          id: data.currentSubUnitId,
          deleted: false,
        },
        select: {
          admins: {
            select: {
              id: true,
            },
          },
          drivers: {
            select: {
              id: true,
            },
          },
          vehicles: {
            select: {
              id: true,
            },
          },
          auditors: {
            select: {
              id: true,
            },
          },
        },
      }),
      this.database.subUnit.findFirst({
        where: {
          id: data.newSubUnitId,
          deleted: false
        }
      }),
    ])

    if (!currentSubUnit) throw new BadRequestException(`subUnit not found with id ${data.currentSubUnitId}`)
    if (!newSubUnit) throw new BadRequestException(`subUnit not found with id ${data.newSubUnitId}`)

    const { admins, vehicles, drivers, auditors } = currentSubUnit

    await this.database.$transaction([
      this.database.vehicle.updateMany({
        where: {
          id: {
            in: vehicles.map((veh) => veh.id),
          },
        },
        data: {
          subUnitId: data.newSubUnitId,
        },
      }),
      this.database.auditor.updateMany({
        where: {
          id: {
            in: auditors.map((auditor) => auditor.id),
          },
        },
        data: {
          subUnitId: data.newSubUnitId,
        },
      }),
      this.database.user.updateMany({
        where: {
          id: {
            in: drivers.map((driver) => driver.id),
          },
        },
        data: {
          subUnitId: data.newSubUnitId,
        },
      }),
      this.database.user.updateMany({
        where: {
          id: {
            in: admins.map((user) => user.id),
          },
        },
        data: {
          subUnitId: data.newSubUnitId,
        },
      }),

      this.database.subUnit.update({
        where: {
          id: data.currentSubUnitId,
        },
        data: {
          deleted: true,
        },
      }),
    ])

    return newSubUnit
  }

  async delete(id: number) {
    // need to update
    const subunit = await this.database.subUnit.findFirst({
      where: {
        id: id,
      },
    });

    if (!subunit) {
      throw new BadRequestException(`Sub unit not found with id: ${id}`)
    }

    const deletedObject = await this.database.$transaction([
      this.database.subUnit.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
      }),
      this.database.auditor.updateMany({
        where: {
          subUnitId: id,
        },
        data: {
          deleted: true,
        },
      }),
      this.database.trip.updateMany({
        where: {
          driver: {
            subUnitId: id,
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.mTRACForm.updateMany({
        where: {
          trip: {
            driver: {
              subUnitId: id,
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.quizzes.updateMany({
        where: {
          MTRACForm: {
            trip: {
              driver: {
                subUnitId: id,
              },
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.bocTrip.updateMany({
        where: {
          driver: {
            subUnitId: id,
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.destination.updateMany({
        where: {
          trip: {
            driver: {
              subUnitId: id,
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.eLog.updateMany({
        where: {
          destination: {
            trip: {
              driver: {
                subUnitId: id,
              },
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.vehicle.updateMany({
        where: {
          subUnitId: id,
        },
        data: {
          deleted: true,
        },
      }),
      this.database.vehicleServicing.updateMany({
        where: {
          vehicle: {
            subUnitId: id,
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
              subUnitId: id,
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
              subUnitId: id,
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
                    subUnitId: id,
                  },
                },
              },
            },
            {
              checkOut: {
                vehicleServicing: {
                  vehicle: {
                    subUnitId: id,
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
                subUnitId: id,
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
                subUnitId: id,
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
                subUnitId: id,
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
              subUnitId: id,
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
                subUnitId: id,
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
                subUnitId: id,
              },
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
    ])
    if (deletedObject?.length) return deletedObject[0]

    return null
  }
}
