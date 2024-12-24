import { Provider, Role } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { CreateBaseAdminDto, FindManyBaseAdminsDto, UpdateBaseAdminDto } from './dto/base-admin.dto';

@Injectable()
export class BaseAdminService {
  constructor(
    private readonly database: DatabaseService
  ) {}

  async create(data: CreateBaseAdminDto) {
    const existingUser = await this.database.user.findFirst({
      where: {
        email: data.email,
        deleted: false,
      },
      include: {
        base: true,
        roles: true,
      },
    })
  
    if (existingUser?.baseAdminId && !existingUser?.base?.deleted) {
      throw new BadRequestException(`User with email ${data.email} already has a base!`)
    }

    const base = await this.database.base.findFirst({
      where: {
        id: data.baseId,
        deleted: false,
      }
    })

    if (!base) {
      throw new BadRequestException(`Base not existed by id: ${data.baseId}!`)
    }

    if (existingUser) {
      const baseAdmin = await this.database.user.update({
        where: {
          id: existingUser?.id,
        },
        data: {
          username: data.email,
          email: data.email,
          base: {
            connect: {
              id: data.baseId,
            },
          },
          roles: {
            connect: {
              name: Role.BASE,
            },
          },
        },
      })
  
      return baseAdmin
    }

    const newBaseAdmin = await this.database.user.create({
      data: {
        username: data.email,
        email: data.email,
        provider: Provider.MICROSOFT,
        base: {
          connect: {
            id: data.baseId,
          },
        },
        roles: {
          connect: {
            name: Role.BASE,
          },
        },
      },
    })

    return newBaseAdmin  
  }

  async update(data: UpdateBaseAdminDto) {
    const { userId } = data

    const existedUser = await this.database.user.findFirst({
      where: {
        id: userId,
        deleted: false,
      }
    })

    if (!existedUser) {
      throw new BadRequestException(`User not existed by id: ${userId}!`)
    }

    const base = await this.database.base.findFirst({
      where: {
        id: data.baseId,
        deleted: false,
      }
    })

    if (!base) {
      throw new BadRequestException(`Base not existed by id: ${data.baseId}!`)
    }

    const updatedBaseAdmin = this.database.user.update({
      where: {
        id: data.userId,
      },
      data: {
        base: {
          connect: {
            id: data.baseId,
          },
        },
      },
    })

    return updatedBaseAdmin
  }

  async delete(id: number) {
    const baseAdminUser = await this.database.user.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        roles: true,
      },
    })
  
    if (!baseAdminUser) {
      throw new BadRequestException(`User not existed by id: ${id}!`)
    }
  
    const baseAdmin = await this.database.user.update({
      where: {
        id,
      },
      data: {
        roles: {
          disconnect: [{ name: Role.BASE }],
        },
        base: {
          disconnect: true,
        },
        deleted: baseAdminUser.roles.length === 1,
      },
    })
  
    return baseAdmin
  }

  async findMany(query: FindManyBaseAdminsDto) {
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
          base: {
            name: { contains: searchValue, mode: "insensitive" }
          }
        }
      ]
    }

    const [baseAdmins, count] = await Promise.all([
      this.database.user.findMany({
        take: Number(limit),
        skip: Number(offset),
        where:{
          ...compileQuery,
          NOT: {
            baseAdminId: null,
          },
          deleted: false,
        },
        orderBy: {
          id: "asc",
        },
        include: {
          roles: true,
          base: true,
        },
      }),
      this.database.user.count({
        where:{
          ...compileQuery,
          NOT: {
            baseAdminId: null,
          },
          deleted: false,
        },
      })
    ])

    return {
      count,
      records: baseAdmins
    }
  }

  async findOne(id: number) {
    const baseAdmin = await this.database.user.findFirst({
      where: {
        id,
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
    })
  
    if (!baseAdmin) {
      throw new BadRequestException(`Base admin with id ${id} doesn't exist!`)
    }
  
    return baseAdmin
  }
}