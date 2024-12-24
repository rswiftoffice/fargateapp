import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/core/database/database.service';
import { CreateLicenseClassDto, FindManyLicenseClassesQueryDto, UpdateLicenseClassDto } from './dto/license-classes.dto';

@Injectable()
export class LicenseClassesService {
  constructor(private database: DatabaseService) {}

  async findAll(name?: string) {
    const results = await this.database.licenseClass.findMany({
      where: {
        class: {
          contains: name,
        },
      },
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        class: true,
      },
    });

    if (!results) return [];
    return results;
  }

  async create(data: CreateLicenseClassDto) {
    const licenseClassAlreadyExist = await this.database.licenseClass.findFirst({
      where: {
        class: data._class,
        deleted: false,
      },
    })
  
    if (licenseClassAlreadyExist) {
      throw new BadRequestException(`Class "${data._class}" already exists!`)
    }
  
    const licenseClass = await this.database.licenseClass.create({
      data: {
        class: data._class,
      },
    })

    return licenseClass
  }

  async update(data: UpdateLicenseClassDto) {
    const licenseClass = await this.database.licenseClass.findFirst({
      where: {
        id: data.id,
        deleted: false,
      }
    })

    if (!licenseClass) {
      throw new BadRequestException(`Class not found with id: ${data.id}`)
    }

    const licenseClassAlreadyExist = await this.database.licenseClass.findFirst({
      where: {
        class: data._class,
        deleted: false,
        NOT: {
          id: data.id
        }
      }
    })

    if (licenseClassAlreadyExist) {
      throw new BadRequestException(`Class "${data._class}" already exists!`)
    }

    const updatedLicenseClass = await this.database.licenseClass.update({
      where: { id: data.id },
      data: { class: data._class },
    })

    return updatedLicenseClass
  }

  async delete(id: number) {
    const licenseClass = await this.database.licenseClass.findFirst({
      where: {
        id,
        deleted: false,
      }
    })

    if (!licenseClass) {
      throw new BadRequestException(`Class not found with id: ${id}`)
    }
  
    const deletedObject = await this.database.$transaction([
      this.database.licenseClass.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
      }),
      this.database.vehiclesPlatforms.updateMany({
        where: {
          licenseClassId: id,
        },
        data: {
          deleted: true,
        },
      }),
      this.database.vehicle.updateMany({
        where: {
          platforms: {
            licenseClassId: id,
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
              licenseClassId: id,
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
              licenseClassId: id,
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
              licenseClassId: id,
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
                licenseClassId: id,
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
                licenseClassId: id,
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

  async findMany(query: FindManyLicenseClassesQueryDto) {
    const { limit, offset = 0, searchValue } = query

    let paginationCondition = {}

    if (limit) {
      paginationCondition = {
        take: limit,
        skip: offset,
      }
    }

    const findingQuery: any = {}

    if (searchValue) {
      findingQuery.class = { contains: searchValue, mode: "insensitive" }
    }

    const [count, licenseClasses] = await Promise.all([
      this.database.licenseClass.count({
        where: {
          ...findingQuery,
          deleted: false,
        }
      }),
      this.database.licenseClass.findMany({
        ...paginationCondition,
        where: {
          ...findingQuery,
          deleted: false,
        },
        orderBy: {
          id: "asc",
        },
      })
    ])

    return {
      count,
      records: licenseClasses
    }
  }

  async findOne(id: number) {
    const licenseClass = await this.database.licenseClass.findFirst({
      where: {
        id,
        deleted: false,
      },
    })

    if (!licenseClass) {
      throw new NotFoundException(`License Class with id ${id} doesn't exist!`)
    }

    return licenseClass
  }
}
