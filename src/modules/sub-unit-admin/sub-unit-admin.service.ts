import { Provider, Role } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { CreateSubUnitAdminDto, FindManySubUnitAdminsQuery, UpdateSubUnitAdminDto } from './dto/sub-unit-admin.dto';

@Injectable()
export class SubUnitAdminsService {
  constructor(
    private readonly database: DatabaseService
  ) {}

  async create(data: CreateSubUnitAdminDto) {
    const existingUser = await this.database.user.findFirst({
      where: {
        email: data.email,
        deleted: false,
      },
      include: {
        adminSubUnit: true,
        roles: true,
      },
    })
  
    if (existingUser?.adminSubUnitId && !existingUser?.adminSubUnit?.deleted) {
      throw new BadRequestException(`User with email ${data.email} already has a subUnit!`)
    }

    const subUnit = await this.database.subUnit.findFirst({
      where: {
        id: data.subUnitId,
        deleted: false,
      }
    })

    if (!subUnit) {
      throw new BadRequestException(`Sub unit not found with id: ${data.subUnitId}`)
    }
  
    if (existingUser) {
      const subUnitAdmin = await this.database.user.update({
        where: {
          id: existingUser?.id,
        },
        data: {
          username: data.email,
          email: data.email,
          adminSubUnit: {
            connect: {
              id: data.subUnitId,
            },
          },
          roles: {
            connect: {
              name: Role.SUB_UNIT,
            },
          },
        },
      })
  
      return subUnitAdmin
    }

    const subUnitAdmin = await this.database.user.create({
      data: {
        username: data.email,
        email: data.email,
        provider: Provider.MICROSOFT,
        adminSubUnit: {
          connect: {
            id: data.subUnitId,
          },
        },
        roles: {
          connect: {
            name: Role.SUB_UNIT,
          },
        },
      },
    })

    return subUnitAdmin
  }

  async update(data: UpdateSubUnitAdminDto) {
    const existingUser = await this.database.user.findFirst({
      where: {
        id: data.userId,
        deleted: false,
        NOT: {
          adminSubUnitId: null,
        }
      },
    })
  
    if (!existingUser) {
      throw new BadRequestException(`Sub unit admin not found with id: ${data.userId}`)
    }

    if (existingUser.adminSubUnitId !== data.subUnitId) {
      const subUnit = await this.database.subUnit.findFirst({
        where: {
          id: data.subUnitId,
          deleted: false,
        }
      })
  
      if (!subUnit) {
        throw new BadRequestException(`Sub unit not found with id: ${data.subUnitId}`)
      }
    }

    const subUnitAdmin = await this.database.user.update({
      where: {
        id: data.userId,
      },
      data: {
        adminSubUnit: {
          connect: {
            id: data.subUnitId,
          },
        },
      },
    })

    return subUnitAdmin
  }

  async delete(userId: number) {
    const subUnitUser = await this.database.user.findFirst({
      where: {
        id: userId,
        deleted: false,
      },
      include: {
        roles: true,
      },
    })
  
    if (!subUnitUser) throw new BadRequestException("Selected User does not exist!")
  
    const subUnitAdmin = await this.database.user.update({
      where: {
        id: userId,
      },
      data: {
        roles: {
          disconnect: [{ name: Role.SUB_UNIT }],
        },
        adminSubUnit: {
          disconnect: true,
        },
        deleted: subUnitUser.roles.length === 1,
      },
    })
  
    return subUnitAdmin
  }

  async findMany(query: FindManySubUnitAdminsQuery) {
    const { limit = 10, offset = 0, searchValue, ...newQuery } = query

    const compileQuery: any = {
      ...newQuery,
    }

    if (newQuery.name) {
      compileQuery.name = { contains: newQuery.name, mode: "insensitive" }
    }
    if (newQuery.email) {
      compileQuery.email = { contains: newQuery.email, mode: "insensitive" }
    }

    if (searchValue) {
      compileQuery.OR = [
        {
          name: { contains: searchValue, mode: "insensitive" }
        },
        {
          email: { contains: searchValue, mode: "insensitive" }
        },
        {
          adminSubUnit: {
            name: { contains: searchValue, mode: "insensitive" }
          }
        }
      ]
    }

    const [subUnitAdmins, count] = await Promise.all([
      this.database.user.findMany({
        take: Number(limit),
        skip: Number(offset),
        where:{
          ...compileQuery,
          NOT: {
            adminSubUnitId: null,
          },
          deleted: false,
        },
        orderBy: {
          id: "asc",
        },
        include: {
          roles: true,
          adminSubUnit: true,
        },
      }),
      this.database.user.count({
        where:{
          ...compileQuery,
          NOT: {
            adminSubUnitId: null,
          },
          deleted: false,
        },
      })
    ])

    return {
      count,
      records: subUnitAdmins
    }
  }

  async findOne(userId: number) {
    const existingUser = await this.database.user.findFirst({
      where: {
        id: userId,
        deleted: false,
        NOT: {
          adminSubUnitId: null,
        }
      },
      include: {
        adminSubUnit: {
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
    })
  
    if (!existingUser) {
      throw new BadRequestException(`Sub unit admin not found with id: ${userId}`)
    }

    return existingUser
  }
}