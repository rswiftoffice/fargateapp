import { Provider, Role } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { CreateMaintenanceAdminDto, FindManyMaintenanceAdminsDto, UpdateMaintenanceAdminDto } from './dto/maintenance-admin.dto';

@Injectable()
export class MaintenanceAdminService {
  constructor(
    private readonly database: DatabaseService,
  ) {}

  async create(data: CreateMaintenanceAdminDto) {
    const existingUser = await this.database.user.findFirst({
      where: {
        email: data.email,
        deleted: false,
      },
      include: {
        maintenanceAdmin: true,
        roles: true,
      },
    })
  
    if (existingUser?.maintenanceAdmin && !existingUser?.maintenanceAdmin?.deleted) {
      throw new BadRequestException(
        `This email '${data.email}' is already being used by another Maintenance admin!`
      )
    }

    const base = await this.database.base.findFirst({
      where: {
        id: data.baseId,
        deleted: false,
      }
    })

    if (!base) {
      throw new BadRequestException(`Base not found with id: ${data.baseId}`)
    }
  
    if (existingUser) {
      const user = await this.database.user.update({
        where: {
          id: existingUser?.id,
        },
        data: {
          username: data.email,
          email: data.email,
          roles: {
            connect: {
              name: Role.MAINTENANCE,
            },
          },
        },
      })

      const maintenanceAdmin = await this.database.maintenanceAdmin.create({
        data: {
          name: data.name,
          description: data.description,
          base: {
            connect: { id: data.baseId },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
        },
        include: {
          user: true,
        },
      })

      return maintenanceAdmin
    }
  
    const user = await this.database.user.create({
      data: {
        username: data.email,
        email: data.email,
        provider: Provider.MICROSOFT,
        roles: {
          connect: {
            name: Role.MAINTENANCE,
          },
        },
      },
    })

    const maintenanceAdmin = await this.database.maintenanceAdmin.create({
      data: {
        name: data.name,
        description: data.description,
        base: {
          connect: { id: data.baseId },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        user: true,
      },
    })

    return maintenanceAdmin
  }

  async update(data: UpdateMaintenanceAdminDto) {
    const maintenanceAdmin = await this.database.maintenanceAdmin.findFirst({
      where: {
        id: data.id,
        deleted: false,
      }
    })

    if (!maintenanceAdmin) {
      throw new BadRequestException(`Maintenance admin not found with id: ${data.id}`)
    }

    if (data.baseId && data.baseId !== maintenanceAdmin.baseId) {
      const base = await this.database.base.findFirst({
        where: {
          id: data.baseId,
          deleted: false,
        }
      })
  
      if (!base) {
        throw new BadRequestException(`Base not found with id: ${data.baseId}`)
      }
    }

    const updatedMaintenanceAdmin = await this.database.maintenanceAdmin.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        base: {
          connect: {
            id: data.baseId,
          },
        },
      },
      include: {
        user: true,
      },
    })
    return updatedMaintenanceAdmin
  }
  
  async delete(id: number) {
    const existingMaintenanceAdmin = await this.database.maintenanceAdmin.findFirst({
      where: {
        id,
        deleted: false
      },
      include: {
        user: {
          include: {
            roles: true,
          },
        },
      },
    })
  
    if (!existingMaintenanceAdmin) {
      throw new BadRequestException(`Maintenance admin not found with id: ${id}`)
    }
  
    const maintenanceAdmin = await this.database.maintenanceAdmin.delete({
      where: {
        id,
      },
    })
  
    await this.database.user.update({
      where: {
        id: existingMaintenanceAdmin.user.id,
      },
      data: {
        roles: {
          disconnect: [{ name: Role.MAINTENANCE }],
        },
        deleted: existingMaintenanceAdmin.user.roles?.length === 1,
      },
    })
  
    return maintenanceAdmin
  }

  async findMany(query: FindManyMaintenanceAdminsDto) {
    const { limit = 10, offset = 0, searchValue } = query

    const findingQuery: any = {} 

    if (searchValue) {
      findingQuery.OR = [
        { name: { contains: searchValue, mode: 'insensitive' }},
        { description: { contains: searchValue, mode: 'insensitive' }},
        {
          user: { email: { contains: searchValue, mode: 'insensitive' }}
        },
        {
          base: { name: { contains: searchValue, mode: 'insensitive' }}
        },
      ]
    }

    const [count, maintenanceAdmins] = await Promise.all([
      this.database.maintenanceAdmin.count({
        where: {
          deleted: false,
          ...findingQuery,
        },
      }),
      this.database.maintenanceAdmin.findMany({
        take: limit,
        skip: offset,
        where: {
          deleted: false,
          ...findingQuery,
        },
        include: {
          user: true,
          base: true,
        },
        orderBy: {
          id: "asc",
        }, 
      })
    ])

    return {
      count,
      records: maintenanceAdmins
    }
  }

  async findOne(id: number) {
    const maintenanceAdmin = await this.database.maintenanceAdmin.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        user: true,
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
    if (!maintenanceAdmin) {
      throw new BadRequestException(`Maintenance admin not found with id: ${id}`)
    }
  
    return maintenanceAdmin
  }
}