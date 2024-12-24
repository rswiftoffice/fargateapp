import { Service } from ".prisma/client";
import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../../core/database/database.service";
import { CreateServiceDto, FindManyServicesDto, TransferServiceDto, UpdateServiceDto } from "./dto/services.dto";

@Injectable()
export class ServicesService {
  constructor(private database: DatabaseService) {}

  async createService(data: CreateServiceDto): Promise<Service> {
    const newService = await this.database.service.create({
      data,
    })

    return newService
  }

  async updateService(data: UpdateServiceDto): Promise<Service> {
    const { id, ...updateData } = data

    const service = await this.database.service.findFirst({
      where: {
        id,
        deleted: false,
      }
    })

    if (!service) {
      throw new BadRequestException(`service not exist by id:${id}.`)
    }

    const updatedService = await this.database.service.update({
      where: {
        id,
      },
      data: updateData,
    })

    return updatedService
  }

  async findOneService(id: number): Promise<Service> {
    const service = await this.database.service.findFirst({
      where: {
        id,
        deleted: false,
      }
    })

    if (!service) {
      throw new BadRequestException(`service not exist by id:${id}.`)
    }

    delete service.deleted

    return service
  }

  async findServices(query: FindManyServicesDto) {
    const { limit = 10, offset = 0, searchValue } = query

    const compiledQuery:any = {}

    if (searchValue) {
      compiledQuery.OR = [
        { 
          name: { contains: searchValue, mode: "insensitive" }
        },
        {
          description: { contains: searchValue, mode: "insensitive" }
        },
      ]
    }

    const [services, count] = await Promise.all([
      this.database.service.findMany({
        where: {
          ...compiledQuery,
          deleted: false
        },
        take: Number(limit),
        skip: Number(offset)
      }),
      this.database.service.count({
        where: {
          ...compiledQuery,
          deleted: false,
        }
      })
    ])

    const validData = services?.map(each => {
      delete each.deleted

      return each
    })

    return {
      records: validData,
      count,
    }
  }
  
  async deleteOneService(id: number): Promise<any> {
    const service = await this.database.service.findFirst({
      where: {
        id,
        deleted: false,
      }
    })

    if (!service) {
      throw new BadRequestException(`service not exist by id:${id}.`)
    }

    const deletedObject = await this.database.$transaction([
      this.database.service.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
      }),
      this.database.command.updateMany({
        where: {
          serviceId: id,
        },
        data: {
          deleted: true,
        },
      }),
      this.database.base.updateMany({
        where: {
          command: {
            serviceId: id,
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.subUnit.updateMany({
        where: {
          base: {
            command: {
              serviceId: id,
            },
          },
        },
        data: {
          deleted: true,
        },
      }),
      this.database.auditor.updateMany({
        where: {
          subUnit: {
            base: {
              command: {
                serviceId: id,
              },
            },
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
              base: {
                command: {
                  serviceId: id,
                },
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
            driver: {
              subUnit: {
                base: {
                  command: {
                    serviceId: id,
                  },
                },
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
                  base: {
                    command: {
                      serviceId: id,
                    },
                  },
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
              base: {
                command: {
                  serviceId: id,
                },
              },
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
                base: {
                  command: {
                    serviceId: id,
                  },
                },
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
                  base: {
                    command: {
                      serviceId: id,
                    },
                  },
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
            base: {
              command: {
                serviceId: id,
              },
            },
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
              base: {
                command: {
                  serviceId: id,
                },
              },
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
                base: {
                  command: {
                    serviceId: id,
                  },
                },
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
                base: {
                  command: {
                    serviceId: id,
                  },
                },
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
                      base: {
                        command: {
                          serviceId: id,
                        },
                      },
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
                      base: {
                        command: {
                          serviceId: id,
                        },
                      },
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
                  base: {
                    command: {
                      serviceId: id,
                    },
                  },
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
                  base: {
                    command: {
                      serviceId: id,
                    },
                  },
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
                  base: {
                    command: {
                      serviceId: id,
                    },
                  },
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
                base: {
                  command: {
                    serviceId: id,
                  },
                },
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
                  base: {
                    command: {
                      serviceId: id,
                    },
                  },
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
                  base: {
                    command: {
                      serviceId: id,
                    },
                  },
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
    if (deletedObject?.length) {
      return deletedObject[0]
    }

    return null
  }

  async transfer(data: TransferServiceDto) {
    const service = await this.database.service.findFirst({
      where: {
        id: data.currentServiceId,
        deleted: false,
      },
      select: {
        commands: {
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
  
    if (!service) throw new BadRequestException(`Service not found with id ${data.currentServiceId}`)

    const newService = await this.database.service.findFirst({
      where: {
        id: data.newServiceId,
        deleted: false
      }
    })

    if (!newService) throw new BadRequestException(`Service not found with id ${data.newServiceId}`)
  
    const { commands, admins } = service
  
    await this.database.$transaction([
      this.database.command.updateMany({
        where: {
          id: {
            in: commands.map((command) => command.id),
          },
        },
        data: {
          serviceId: data.newServiceId,
        },
      }),
      this.database.user.updateMany({
        where: {
          id: {
            in: admins.map((user) => user.id),
          },
        },
        data: {
          serviceId: data.newServiceId,
        },
      }),
      this.database.service.update({
        where: {
          id: data.currentServiceId,
        },
        data: {
          deleted: true,
        },
      }),
    ])

    return newService
  }
}
