import { Provider, Role } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { CreateServiceAdminDto, FindOneServiceAdminQueryDto, GetServiceAdminsQueryDto, UpdateServiceAdminDto } from './dto/service-admins.dto';

@Injectable()
export class ServiceAdminsService {
  constructor(private database: DatabaseService) {}

  async createServiceAdmin(data: CreateServiceAdminDto) {
    const existingUser = await this.database.user.findFirst({
      where: {
        email: data.email,
        deleted: false,
      },
      include: {
        service: true,
        roles: true,
      },
    })
  
    if (existingUser?.serviceId && !existingUser?.service?.deleted) {
      throw new BadRequestException(`User with email ${data.email} already has a service!`)
    }

    const service = await this.database.service.findFirst({
      where: {
        id: data.serviceId,
        deleted: false,
      }
    })

    if (!service) {
      throw new BadRequestException(`Service not found with id: ${data.serviceId}!`)
    }
  
    if (existingUser) {
      const serviceAdmin = await this.database.user.update({
        where: {
          id: existingUser?.id,
        },
        data: {
          username: data.email,
          email: data.email,
          service: {
            connect: {
              id: data.serviceId,
            },
          },
          roles: {
            connect: {
              name: Role.SERVICES,
            },
          },
        },
      })
      return serviceAdmin
    }

    const newServiceAdmin = await this.database.user.create({
      data: {
        username: data.email,
        email: data.email,
        provider: Provider.MICROSOFT,
        service: {
          connect: {
            id: data.serviceId,
          },
        },
        roles: {
          connect: {
            name: Role.SERVICES,
          },
        },
      },
    })

    return newServiceAdmin
  }

  async updateServiceAdmin(data: UpdateServiceAdminDto) {
    const existingUser = await this.database.user.findFirst({
      where: {
        id: data.userId,
        deleted: false,
      },
      include: {
        service: true,
        roles: true,
      },
    })
  
    if (!existingUser) {
      throw new BadRequestException(`User not found with id: ${data.userId}!`)
    }

    const service = await this.database.service.findFirst({
      where: {
        id: data.serviceId,
        deleted: false,
      }
    })

    if (!service) {
      throw new BadRequestException(`Service not found with id: ${data.serviceId}!`)
    }

    const updatedServiceAdmin = await this.database.user.update({
      where: {
        id: data.userId,
      },
      data: {
        service: {
          connect: {
            id: data.serviceId,
          },
        },
      },
    })

    return updatedServiceAdmin
  }

  async deleteServiceAdmin(query: FindOneServiceAdminQueryDto) {
    const serviceUser = await this.database.user.findFirst({
      where: {
        id: query.userId,
        deleted: false
      },
      include: {
        roles: true,
      },
    })
  
    if (!serviceUser) throw new BadRequestException("Selected User does not exist!")
  
    const serviceAdmin = await this.database.user.update({
      where: {
        id: query.userId,
      },
      data: {
        roles: {
          disconnect: [{ name: Role.SERVICES }],
        },
        service: {
          disconnect: true,
        },
        deleted: serviceUser.roles.length === 1,
      },
    })
  
    return serviceAdmin
  }

  async findOneServiceAdmin(query: FindOneServiceAdminQueryDto) {
    const serviceUser = await this.database.user.findFirst({
      where: {
        id: query.userId,
        deleted: false
      },
      include: {
        roles: true,
        service: true,
      },
    })
  
    if (!serviceUser) throw new BadRequestException(`Service admin with id ${query.userId} doesn't exist`)
  
    return serviceUser
  }

  async findManyServiceAdmins(query: GetServiceAdminsQueryDto) {
    const { limit = 10, offset = 0, searchValue ,...newQuery } = query

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
          service: {
            name: { contains: searchValue, mode: "insensitive" }
          }
        }
      ]
    }

    const [serviceAdmins, count] = await Promise.all([
      this.database.user.findMany({
        take: Number(limit),
        skip: Number(offset),
        where:{
          ...compileQuery,
          NOT: {
            serviceId: null,
          },
          deleted: false,
        },
        orderBy: {
          id: "asc",
        },
        include: {
          roles: true,
          service: true,
        },
      }),
      this.database.user.count({
        where:{
          ...compileQuery,
          NOT: {
            serviceId: null,
          },
          deleted: false,
        },
      })
    ])

    return {
      count,
      records: serviceAdmins
    }
  }
}