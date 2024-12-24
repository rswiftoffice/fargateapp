import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { CreateVehiclePlatformDto, FindManyVehiclePlatformsDto, UpdateVehiclePlatformDto } from './dto/vehicle-platforms.dto';

@Injectable()
export class VehiclePlatformsService {
  constructor(
    private readonly database: DatabaseService
  ) {}

  async create(data: CreateVehiclePlatformDto) {
    const licenseClass = await this.database.licenseClass.findFirst({
      where: {
        id: data.licenseClassId,
        deleted: false,
      }
    })

    if (!licenseClass) {
      throw new BadRequestException(`License class not found with id: ${data.licenseClassId}`)
    }

    const vehiclePlatform = await this.database.vehiclesPlatforms.create({
      data: {
        name: data.name,
        licenseClass: {
          connect: {
            id: data.licenseClassId
          }
        }
      },
    })

    return vehiclePlatform
  }

  async update(data: UpdateVehiclePlatformDto) {
    const vehiclePlatform = await this.database.vehiclesPlatforms.findFirst({
      where: {
        id: data.id,
        deleted: false,
      }
    })

    if (!vehiclePlatform) {
      throw new BadRequestException(`Vehicle platform not found with id: ${data.id}`)
    }

    if (data.licenseClassId && data.licenseClassId !== vehiclePlatform.licenseClassId) {
      const licenseClass = await this.database.licenseClass.findFirst({
        where: {
          id: data.licenseClassId,
          deleted: false,
        }
      })
  
      if (!licenseClass) {
        throw new BadRequestException(`License class not found with id: ${data.licenseClassId}`)
      }
    }

    const updatedVehiclePlatform = await this.database.vehiclesPlatforms.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        licenseClass: {
          connect: {
            id: data.licenseClassId
          }
        }
      }
    })

    return updatedVehiclePlatform
  }

  async delete(id: number) {
    const vehiclePlatform = await this.database.vehiclesPlatforms.findFirst({
      where: {
        id,
        deleted: false,
      }
    })

    if (!vehiclePlatform) {
      throw new BadRequestException(`Vehicle platform not found with id: ${id}`)
    }

    const deletedObject = await this.database.$transaction([
      this.database.vehiclesPlatforms.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
      }),
      this.database.vehicle.updateMany({
        where: {
          platforms: {
            id,
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.vehicleServicing.updateMany({
        where: {
          vehicle: {
            platforms: {
              id,
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.trip.updateMany({
        where: {
          vehicle: {
            platforms: {
              id,
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.bocTrip.updateMany({
        where: {
          vehicle: {
            platforms: {
              id,
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
            vehicle: {
              platforms: {
                id,
              },
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
            vehicle: {
              platforms: {
                id,
              },
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
    ])

    return deletedObject[0]
  }

  async findMany(query: FindManyVehiclePlatformsDto) {
    const { limit = 10, offset = 0, searchValue } = query

    const findingQuery: any = {}
    
    if (searchValue) {
      findingQuery.OR = [
        {
          name: { contains: searchValue, mode: 'insensitive' }
        },
        {
          licenseClass: {
            class: { contains: searchValue, mode: 'insensitive' }
          }
        }
      ]
    }

    const [count, vehiclePlatforms] = await Promise.all([
      this.database.vehiclesPlatforms.count({
        where: {
          ...findingQuery,
          deleted: false,
        }
      }),
      this.database.vehiclesPlatforms.findMany({
        take: limit,
        skip: offset,
        where: {
          ...findingQuery,
          deleted: false,
        },
        orderBy: {
          id: "asc",
        },
        include: {
          licenseClass: true,
        },
      })
    ])

    return {
      count,
      records: vehiclePlatforms
    }
  }

  async findOne(id: number) {
    const vehiclePlatform = await this.database.vehiclesPlatforms.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        licenseClass: true,
      },
    })

    if (!vehiclePlatform) {
      throw new BadRequestException(`Vehicle platform not found with id: ${id}`)
    }

    return vehiclePlatform
  }
}