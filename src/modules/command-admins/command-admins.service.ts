import { Command, Provider, Role, User } from '.prisma/client';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { CreateCommandAdminDto, GetListCommandAdminsQueryDto, UpdateCommandAdminDto } from './dto/command-admins.dto';

@Injectable()
export class CommandAdminsService {
  constructor(private database: DatabaseService) { }

  async createCommandAdmin(data: CreateCommandAdminDto): Promise<User> {
    const existingUser = await this.database.user.findFirst({
      where: {
        email: data.email,
        deleted: false,
      },
      include: {
        command: true,
        roles: true,
      },
    })

    if (existingUser?.commandId && !existingUser?.command?.deleted) {
      throw new BadRequestException(`User with email ${data.email} already has a command!`)
    }

    if (existingUser) {
      const commandAdmin = await this.database.user.update({
        where: {
          id: existingUser?.id,
        },
        data: {
          username: data.email,
          email: data.email,
          command: {
            connect: {
              id: data.commandId,
            },
          },
          roles: {
            connect: {
              name: Role.COMMAND,
            },
          },
        },
      })

      return commandAdmin
    }

    const commandAdmin = await this.database.user.create({
      data: {
        username: data.email,
        email: data.email,
        provider: Provider.MICROSOFT,
        command: {
          connect: {
            id: data.commandId,
          },
        },
        roles: {
          connect: {
            name: Role.COMMAND,
          },
        },
      },
    })

    return commandAdmin
  }

  async updateCommandAdmin(data: UpdateCommandAdminDto): Promise<User> {
    const commandAdmin = await this.database.user.update({
      where: {
        id: data.userId,
      },
      data: {
        command: {
          connect: {
            id: data.commandId,
          },
        },
      },
    })
    return commandAdmin
  }

  async deleteCommandAdmin(userId: number) {
    const commandUser = await this.database.user.findFirst({
      where: {
        id: userId,
        deleted: false,
      },
      include: {
        roles: true,
      },
    })
  
    if (!commandUser) throw new BadRequestException('Selected User does not exist!')
 
    const commandAdmin = await this.database.user.update({
      where: {
        id: userId,
      },
      data: {
        roles: {
          disconnect: [{ name: Role.COMMAND }],
        },
        command: {
          disconnect: true,
        },
        deleted: commandUser.roles.length === 1,
      },
    })

    return commandAdmin
  }

  async findManyCommandAdmins(query: GetListCommandAdminsQueryDto) {
    const { limit = 10, offset = 0, searchValue, ...newQuery } = query
    if (searchValue) {
      newQuery['OR'] = [
        { email: { contains: searchValue, mode: "insensitive" } },
        { command: { name: { contains: searchValue, mode: "insensitive" } } },
      ]
    }
    const [commandAdmins, count] = await Promise.all([
      this.database.user.findMany({
        take: Number(limit),
        skip: Number(offset),
        where: {
          ...newQuery,
          deleted: false,
          NOT: [{ commandId: null }],
        },
        orderBy: {
          id: 'asc',
        },
        include: {
          roles: true,
          command: {
            include: {
              service: true,
            }
          },
        },
      }),
      this.database.user.count({
        where: {
          ...newQuery,
          deleted: false,
          NOT: [{ commandId: null }],
        },
      }),
    ])

    const validData = commandAdmins?.map(each => {
      delete each.deleted

      return each
    })

    return {
      count,
      records: validData
    }
  }

  async findOneCommandAdmin(userId: number): Promise<User> {
    const commandAdmin = await this.database.user.findFirst({
      where: { id: Number(userId) },
      include: {
        roles: true,
        command: {
          include: {
            service: true,
          }
        },
      },
    })

    if (!commandAdmin) throw new BadRequestException(`Command admin with userId ${userId} doesn't exist!`)

    return commandAdmin
  }
}