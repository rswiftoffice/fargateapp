import { Provider, Role } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { CreateAuditorAdminDto, FindManyAuditorAdminsQueryDto, UpdateAuditorAdminDto } from './dto/auditor-admins.dto';

@Injectable()
export class AuditorAdminsService {
  constructor(
    private database: DatabaseService
  ) {}

  async create(data: CreateAuditorAdminDto) {
    const existingUser = await this.database.user.findFirst({
      where: {
        email: data.email,
        deleted: false,
      },
      include: {
        auditor: true,
        roles: true,
      },
    })
  
    if (existingUser?.auditor && !existingUser?.auditor?.deleted) {
      throw new BadRequestException(`This email "${data.email}" is already being used by another auditor admin!`)
    }

    const subUnit = await this.database.subUnit.findFirst({
      where: {
        id: data.subUnitId,
        deleted: false,
      }
    })

    if (!subUnit) {
      throw new BadRequestException(`Sub unit not found with id: ${ data.subUnitId}`)
    }
  
    if (existingUser) {
      const auditorUser = await this.database.user.update({
        where: {
          id: existingUser?.id,
        },
        data: {
          roles: {
            connect: {
              name: Role.AUDITOR,
            },
          },
        },
      })
      const auditorAdmin = await this.database.auditor.create({
        data: {
          name: data.name,
          description: data.description,
          subUnit: {
            connect: { id: data.subUnitId },
          },
          user: {
            connect: {
              id: auditorUser.id,
            },
          },
        },
        include: {
          user: true,
        },
      })

      return auditorAdmin
    }
  
    const auditorUser = await this.database.user.create({
      data: {
        username: data.email,
        email: data.email,
        provider: Provider.MICROSOFT,
        roles: {
          connect: {
            name: Role.AUDITOR,
          },
        },
      },
    })

    const auditorAdmin = await this.database.auditor.create({
      data: {
        name: data.name,
        description: data.description,
        subUnit: {
          connect: { id: data.subUnitId },
        },
        user: {
          connect: {
            id: auditorUser.id,
          },
        },
      },
      include: {
        user: true,
      },
    })
    return auditorAdmin
  }

  async updateAuditorAdmin(data: UpdateAuditorAdminDto) {
    const auditorAdmin = await this.database.auditor.findFirst({
      where: {
        id: data.id,
        deleted: false,
      }
    })

    if (!auditorAdmin) {
      throw new BadRequestException(`Auditor admin not found with id: ${data.id}`)
    }

    if (data.subUnitId && data.subUnitId !== auditorAdmin.subUnitId) {
      const subUnit = await this.database.subUnit.findFirst({
        where: {
          id: data.subUnitId,
          deleted: false,
        }
      })
  
      if (!subUnit) {
        throw new BadRequestException(`Sub unit not found with id: ${ data.subUnitId}`)
      }
    
    }

    const updatedAuditorAdmin = await this.database.auditor.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        subUnit: {
          connect: {
            id: data.subUnitId,
          },
        },
      },
      include: {
        user: true,
      },
    })

    return updatedAuditorAdmin
  }

  async deleteAuditorAdmin(id: number) {
    const auditor = await this.database.auditor.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        user: {
          include: {
            roles: true,
          },
        },
      },
    })
  
    if (!auditor) throw new BadRequestException("Selected User does not exist!")
  
    const auditorAdmin = await this.database.auditor.delete({
      where: {
        id,
      },
    })
  
    await this.database.user.update({
      where: {
        id: auditor.user.id,
      },
      data: {
        roles: {
          disconnect: [{ name: Role.AUDITOR }],
        },
        deleted: auditor.user.roles.length === 1,
      },
    })
  
    return auditorAdmin
  }

  async findManyAuditorAdmin(query: FindManyAuditorAdminsQueryDto) {
    const { limit = 10, offset = 0, searchValue } = query

    const findingQuery: any = {}
    
    if (searchValue) {
      findingQuery.OR = [
        {
          name: { contains: searchValue, mode: "insensitive" }
        },
        { 
          description: { contains: searchValue, mode: "insensitive" }
        },
        {
          subUnit: {
            name: { contains: searchValue, mode: "insensitive" }
          }
        },
        {
          user: {
            email: { contains: searchValue, mode: "insensitive" }
          }
        }
      ]
    }

    const [count, auditors] = await Promise.all([
      this.database.auditor.count({
        where: {
          ...findingQuery,
          deleted: false,
        }
      }),
      this.database.auditor.findMany({
        where: {
          ...findingQuery,
          deleted: false,
        },
        take: limit,
        skip: offset,
        include: {
          user: true,
          subUnit: true,
        },
        orderBy: {
          id: "asc",
        },
      })
    ])

    return {
      count,
      records: auditors
    }
  }

  async findOne(id: number) {
    const auditor = await this.database.auditor.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        user: true,
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
    })
  
    if (!auditor) throw new BadRequestException("Selected User does not exist!")

    return auditor
  }
}
