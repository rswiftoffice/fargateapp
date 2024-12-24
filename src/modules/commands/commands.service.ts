import { Command } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { CreateCommandDto, FindManyCommandsDto, TransferCommandDto, UpdateCommandDto } from './dto/commands.dto';

@Injectable()
export class CommandsService {
  constructor(private database: DatabaseService) {}

  async createCommands(data: CreateCommandDto): Promise<Command> {
    const newCommand = await this.database.command.create({
      data,
    })

    return newCommand
  }

  async updateCommands(id: number, data: UpdateCommandDto): Promise<Command> {
    const updatedCommands = await this.database.command.update({
      where: {
        id,
      },
      data
    })

    return updatedCommands
  }

  async findOneCommands(id: number): Promise<Command> {
    const command = await this.database.command.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        service: true,
      }
    })

    if (!command) {
      throw new BadRequestException(`command not exist by id:${id}.`)
    }

    delete command.deleted

    return command
  }

  async findAll(query: FindManyCommandsDto) {
    const { limit = 10, offset = 0, searchValue, ...newQuery } = query

    const compileQuery: any = {
      ...newQuery,
      deleted: false,
    }

    if (searchValue) {
      compileQuery.OR = [
        {
          name: { contains: searchValue, mode: "insensitive" }
        },
        {
          description: { contains: searchValue, mode: "insensitive" }
        },
        {
          service: {
            name: { contains: searchValue, mode: "insensitive" }
          }
        }
      ]
    }

    const [commands, count] = await Promise.all([
      this.database.command.findMany({
        where: compileQuery,
        include: {
          service: true
        },
        take: Number(limit),
        skip: Number(offset),
      }),
      this.database.command.count({
        where: compileQuery
      }),
    ])

    const validData = commands?.map(each => {
      delete each.deleted

      return each
    })

    return {
      count,
      records: validData
    }
  }
  
  async deleteOneCommands(id: number): Promise<boolean> {
    const command = await this.database.command.findFirst({
      where: {
        id,
        deleted: false,
      }
    })

    if (!command) {
      throw new BadRequestException(`command not exist by id:${id}.`)
    }

    await this.database.command.update({
      where: { id },
      data: { deleted: true }
    })

    return true
  }

  async transferCommand(data: TransferCommandDto) {
    const command = await this.database.command.findFirst({
      where: {
        id: Number(data.currentCommandId),
        deleted: false,
      },
      select: {
        bases: {
          select: {
            id: true,
          },
        },
        admins: {
          select: {
            id: true,
          },
        },
      },
    })
    
    const newCommand = await this.database.command.findFirst({
      where: {
        id: Number(data.newCommandId),
        deleted: false,
      }
    })

    if (!newCommand) throw new BadRequestException(`new Command not found with id ${data.newCommandId}`)
    if (!command) throw new BadRequestException(`Current command not found with id ${data.currentCommandId}`)
  
    const { bases, admins } = command
  
    await this.database.$transaction([
      this.database.base.updateMany({
        where: {
          id: {
            in: bases.map((base) => base.id),
          },
        },
        data: {
          commandId: Number(data.newCommandId),
        },
      }),
      this.database.user.updateMany({
        where: {
          id: {
            in: admins.map((user) => user.id),
          },
        },
        data: {
          commandId: Number(data.newCommandId),
        },
      }),
      this.database.command.update({
        where: {
          id: data.currentCommandId,
        },
        data: {
          deleted: true,
        },
      }),
    ])

    return true
  }
}
