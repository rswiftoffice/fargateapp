import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/core/database/database.service';
import { CreateBaseDto, FindManyBasesQueryDto, TransferBaseDto, UpdateBaseDto } from './dto/base.dto';

@Injectable()
export class BaseService {
  constructor(private database: DatabaseService) {}

  async create(data: CreateBaseDto) {
    const baseCreated = await this.database.base.create({ data });

    return baseCreated
  }

  async update(data: UpdateBaseDto) {
    const base = await this.database.base.findFirst({
      where: {
        id: data.id,
        deleted: false,
      }
    })

    if (!base) {
      throw new BadRequestException(`base not exist by id: ${data.id}.`)

    }

    const baseUpdated = await this.database.base.update({
      where: {
        id: data.id,
      },
      data,
    });

    return baseUpdated;
  }

  async remove(id: number) {
    const base = await this.database.base.findFirst({
      where: {
        id,
        deleted: false,
      }
    })

    if (!base) {
      throw new BadRequestException(`base not exist by id: ${id}.`)

    }

    const deletedObject = await this.database.$transaction([
      this.database.base.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
      }),
      this.database.subUnit.updateMany({
        where: {
          baseId: id,
        },
        data: {
          deleted: true,
        },
      }),
      this.database.auditor.updateMany({
        where: {
          subUnit: {
            baseId: id,
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.trip.updateMany({
        where: {
          driver: {
            subUnit: {
              baseId: id,
            },
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
              subUnit: {
                baseId: id,
              },
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
                subUnit: {
                  baseId: id,
                },
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
            subUnit: {
              baseId: id,
            },
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
              subUnit: {
                baseId: id,
              },
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
                subUnit: {
                  baseId: id,
                },
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
          subUnit: {
            baseId: id,
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.vehicleServicing.updateMany({
        where: {
          vehicle: {
            subUnit: {
              baseId: id,
            },
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
              subUnit: {
                baseId: id,
              },
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
              subUnit: {
                baseId: id,
              },
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
                    subUnit: {
                      baseId: id,
                    },
                  },
                },
              },
            },
            {
              checkOut: {
                vehicleServicing: {
                  vehicle: {
                    subUnit: {
                      baseId: id,
                    },
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
                subUnit: {
                  baseId: id,
                },
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
                subUnit: {
                  baseId: id,
                },
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
                subUnit: {
                  baseId: id,
                },
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
              subUnit: {
                baseId: id,
              },
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
                subUnit: {
                  baseId: id,
                },
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
                subUnit: {
                  baseId: id,
                },
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

  async findAll(query: FindManyBasesQueryDto) {
    const { limit = 10, offset = 0, searchValue, ...newQuery } = query

    const compiledQuery: any = {
      ...newQuery,
      deleted: false,
    }

    if (searchValue) {
      compiledQuery.OR = [
        {
          name: { contains: searchValue, mode: "insensitive" }
        },
        {
          description: { contains: searchValue, mode: "insensitive" }
        },
        {
          command: {
            name: { contains: searchValue, mode: "insensitive" }
          }
        }
      ]
    }
    const [bases, count] = await Promise.all([
      this.database.base.findMany({
        where: compiledQuery,
        take: Number(limit),
        skip: Number(offset),
        include: {
          command: true,
        },
        orderBy: {
          id: "asc",
        },
      }),
      this.database.base.count({
        where: compiledQuery,
      }),
    ])

    return {
      records: bases,
      count,
    }
  }

  async findOne(id: number) {
    const base = await this.database.base.findFirst({
      where: { id },
      include: {
        command: {
          include: {
            service: true,
          },
        },
      },
    })

    if (!base) {
      throw new BadRequestException(`base not exist by id: ${id}.`)

    }

    return base;
  }

  async transfer(data: TransferBaseDto) {
    const [base, newBase] = await Promise.all([
      this.database.base.findFirst({
        where: {
          id: data.currentBaseId,
          deleted: false,
        },
        select: {
          subUnits: {
            select: {
              id: true,
            },
          },
          admins: {
            select: {
              id: true,
            },
          },
          maintenanceAdmins: {
            select: {
              id: true,
            },
          },
        },
      }),
      this.database.base.findFirst({
        where: {
          id: data.newBaseId,
          deleted: false,
        }
      }),
    ])

    if (!base) throw new BadRequestException(`Base not found with id ${data.currentBaseId}`)
    if (!newBase) throw new BadRequestException(`Base not found with id ${data.newBaseId}`)

    const { subUnits, admins, maintenanceAdmins } = base

    await this.database.$transaction([
      this.database.subUnit.updateMany({
        where: {
          id: {
            in: subUnits.map((subUnit) => subUnit.id),
          },
        },
        data: {
          baseId: data.newBaseId,
        },
      }),
      this.database.maintenanceAdmin.updateMany({
        where: {
          id: {
            in: maintenanceAdmins.map((maintenanceAdmin) => maintenanceAdmin.id),
          },
        },
        data: {
          baseId: data.newBaseId,
        },
      }),
      this.database.user.updateMany({
        where: {
          id: {
            in: admins.map((user) => user.id),
          },
        },
        data: {
          baseAdminId: data.newBaseId,
        },
      }),
      this.database.base.update({
        where: {
          id: data.currentBaseId,
        },
        data: {
          deleted: true,
        },
      }),
    ])

    return newBase
  }
}
