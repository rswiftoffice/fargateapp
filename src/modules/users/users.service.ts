import { Role, User } from '.prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from 'src/core/database/database.service';
import { RequestedUser } from './entities/user.entity';
import { FindUsersDto } from './dto/user.dto';
import { Provider } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private database: DatabaseService) {}
  async createOne(data): Promise<User> {
    const existingUser = await this.database.user.findFirst({
      where: {
        email: data.email,
        deleted: false,
      },
      include: {
        subUnit: true,
        roles: true,
      },
    });
    const validateRoles = [
      Role.DRIVER,
      Role.PRE_APPROVED_DRIVER,
      Role.APPROVING_OFFICER,
      Role.MAC,
    ];
    const validatedUser = existingUser?.roles?.find((role: any) =>
      validateRoles.includes(role.name),
    );

    if (validatedUser) {
      throw new BadRequestException(
        `A user '${data.email}' already exists with a subunit '${existingUser.subUnit.name}'. Please try using another email!`,
      );
    }

    const [subUnit, licenseClasses] = await Promise.all([
      this.database.subUnit.findFirst({
        where: {
          id: data.subUnitId,
          deleted: false,
        },
      }),
      this.database.licenseClass.findMany({
        where: {
          id: {
            in: data.licenseClasses ? data.licenseClasses : [],
          },
        },
      }),
    ]);

    if (!subUnit && data.subUnitId) {
      throw new BadRequestException(
        `SubUnit not exist by id:${data.subUnitId}.`,
      );
    }

    if (data?.licenseClasses?.length) {
      if (!licenseClasses?.length) {
        throw new BadRequestException(
          `licenseClasses not exist by ids: [${data.licenseClasses.join(
            ', ',
          )}].`,
        );
      }
      const notFoundLicenseClasses = data?.licenseClasses?.filter(
        (licenseClassId) => {
          return !!!licenseClasses.find((each) => each.id === licenseClassId);
        },
      );

      if (notFoundLicenseClasses?.length) {
        throw new BadRequestException(
          `licenseClasses not exist by ids: [${notFoundLicenseClasses.join(
            ', ',
          )}].`,
        );
      }
    }
    if (!existingUser) {
      const newUser = await this.database.user.create({
        data: {
          name: data.name,
          username: data.email,
          email: data.email,
          provider: Provider.MICROSOFT,
          roles: {
            connect: data.roles?.map((name) => ({
              name,
            })),
          },
          subUnit: {
            connect: {
              id: data.subUnitId,
            },
          },
          licenseClasses: {
            connect: data.licenseClasses?.map((id) => ({
              id,
            })),
          },
        },
      });

      return newUser;
    } else {
      return await this.database.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          name: data.name,
          roles: {
            connect: data.roles?.map((name) => ({
              name,
            })),
          },
          licenseClasses: {
            connect: data.licenseClasses?.map((id) => ({
              id,
            })),
          },
          subUnit: {
            connect: {
              id: data.subUnitId,
            },
          },
        },
      });
    }
  }

  async findAll(query: FindUsersDto, user = null) {
    const { limit = 10, offset = 0, searchValue } = query;

    if (user && user.roles[0] === 'SUPER_ADMIN') {
      const [users, count] = await Promise.all([
        this.database.user.findMany({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: searchValue, mode: 'insensitive' } },
                  { username: { contains: searchValue, mode: 'insensitive' } },
                ],
              },
              {
                deleted: false,
              },
            ],
          },
          include: {
            roles: true,
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
          take: Number(limit),
          skip: Number(offset),
          orderBy: {
            id: 'desc',
          },
        }),
        this.database.user.count({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: searchValue, mode: 'insensitive' } },
                  { username: { contains: searchValue, mode: 'insensitive' } },
                ],
              },
              {
                deleted: false,
              },
            ],
          },
        }),
      ]);
      const validData = users.map((each) => {
        delete each.deleted;
        return each;
      });
      return {
        count,
        records: validData,
      };
    } else if (user && user.roles[0] === 'SERVICES' && user.serviceId) {
      const [users, count] = await Promise.all([
        this.database.user.findMany({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: searchValue, mode: 'insensitive' } },
                  { username: { contains: searchValue, mode: 'insensitive' } },
                ],
              },
              {
                deleted: false,
                NOT: {
                  roles: {
                    some: {
                      name: Role.SUPER_ADMIN,
                    },
                  },
                },
              },
            ],
          },
          include: {
            roles: true,
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
          take: Number(limit),
          skip: Number(offset),
          orderBy: {
            id: 'desc',
          },
        }),
        this.database.user.count({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: searchValue, mode: 'insensitive' } },
                  { username: { contains: searchValue, mode: 'insensitive' } },
                ],
              },
              {
                deleted: false,
                NOT: {
                  roles: {
                    some: {
                      name: Role.SUPER_ADMIN,
                    },
                  },
                },
              },
            ],
          },
        }),
      ]);
      const validData = users.map((each) => {
        delete each.deleted;
        return each;
      });
      return {
        count,
        records: validData,
      };
    } else if (user && user.roles[0] === 'COMMAND' && user.commandId) {
      const [users, count] = await Promise.all([
        this.database.user.findMany({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: searchValue, mode: 'insensitive' } },
                  { username: { contains: searchValue, mode: 'insensitive' } },
                ],
              },
              {
                deleted: false,
                NOT: {
                  roles: {
                    some: {
                      name: Role.SERVICES,
                    },
                  },
                },
                subUnit: {
                  base: {
                    command: {
                      id: user.commandId,
                    },
                  },
                },
              },
            ],
          },
          include: {
            roles: true,
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
          take: Number(limit),
          skip: Number(offset),
          orderBy: {
            id: 'desc',
          },
        }),
        this.database.user.count({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: searchValue, mode: 'insensitive' } },
                  { username: { contains: searchValue, mode: 'insensitive' } },
                ],
              },
              {
                deleted: false,
                NOT: {
                  roles: {
                    some: {
                      name: Role.SERVICES,
                    },
                  },
                },
                subUnit: {
                  base: {
                    command: {
                      id: user.commandId,
                    },
                  },
                },
              },
            ],
          },
        }),
      ]);
      const validData = users.map((each) => {
        delete each.deleted;
        return each;
      });
      return {
        count,
        lengght: validData.length,
        records: validData,
      };
    } else if (user && user.roles[0] === 'BASE' && user.baseAdminId) {
      const [users, count] = await Promise.all([
        this.database.user.findMany({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: searchValue, mode: 'insensitive' } },
                  { username: { contains: searchValue, mode: 'insensitive' } },
                ],
              },
              {
                deleted: false,
                NOT: {
                  roles: {
                    some: {
                      OR: [{ name: Role.SERVICES }, { name: Role.COMMAND }],
                    },
                  },
                },
                subUnit: {
                  base: {
                    id: user.baseAdminId,
                  },
                },
              },
            ],
          },
          include: {
            roles: true,
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
          take: Number(limit),
          skip: Number(offset),
          orderBy: {
            id: 'desc',
          },
        }),
        this.database.user.count({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: searchValue, mode: 'insensitive' } },
                  { username: { contains: searchValue, mode: 'insensitive' } },
                ],
              },
              {
                deleted: false,
                NOT: {
                  roles: {
                    some: {
                      OR: [{ name: Role.SERVICES }, { name: Role.COMMAND }],
                    },
                  },
                },
                subUnit: {
                  base: {
                    id: user.baseAdminId,
                  },
                },
              },
            ],
          },
        }),
      ]);
      const validData = users.map((each) => {
        delete each.deleted;
        return each;
      });
      return {
        count,
        lengght: validData.length,
        records: validData,
      };
    } else if (user && user.roles[0] === 'SUB_UNIT' && user.subUnitId) {
      const [users, count] = await Promise.all([
        this.database.user.findMany({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: searchValue, mode: 'insensitive' } },
                  { username: { contains: searchValue, mode: 'insensitive' } },
                ],
              },
              {
                deleted: false,
                subUnitId: user.subUnitId,
                NOT: {
                  roles: {
                    some: {
                      OR: [
                        { name: Role.SERVICES },
                        { name: Role.COMMAND },
                        { name: Role.BASE },
                      ],
                    },
                  },
                },
              },
            ],
          },
          include: {
            roles: true,
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
          take: Number(limit),
          skip: Number(offset),
          orderBy: {
            id: 'desc',
          },
        }),
        this.database.user.count({
          where: {
            AND: [
              {
                OR: [
                  { name: { contains: searchValue, mode: 'insensitive' } },
                  { username: { contains: searchValue, mode: 'insensitive' } },
                ],
              },
              {
                deleted: false,
                subUnitId: user.subUnitId,
                NOT: {
                  roles: {
                    some: {
                      OR: [
                        { name: Role.SERVICES },
                        { name: Role.COMMAND },
                        { name: Role.BASE },
                      ],
                    },
                  },
                },
              },
            ],
          },
        }),
      ]);
      const validData = users.map((each) => {
        delete each.deleted;
        return each;
      });
      console.log(users, '===users');
      return {
        count,
        records: validData,
      };
    }
  }

  async findById(id: number): Promise<User> {
    const user = await this.database.user.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        roles: true,
        service: true,
        licenseClasses: true,
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
    });

    if (!user) {
      throw new BadRequestException(`user not exist by id:${id}.`);
    }

    delete user.deleted;

    return user;
  }

  async findOne(username: string) {
    const user = await this.database.user.findFirst({
      where: {
        OR: [
          {
            email: {
              equals: username,
              mode: 'insensitive',
            },
          },
          {
            username,
          },
        ],
        deleted: false,
      },
      include: {
        roles: {
          select: {
            name: true,
          },
        },
        subUnit: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      roles: user.roles.map((role) => role.name),
    };
  }

  async updateUser(id: number, data: any): Promise<User> {
    const { roles, licenseClasses, subUnitId, ...updateData } = data;
    const [subUnit, existedLicenseClasses] = await Promise.all([
      this.database.subUnit.findFirst({
        where: {
          id: subUnitId,
          deleted: false,
        },
      }),
      this.database.licenseClass.findMany({
        where: {
          id: {
            in: licenseClasses ? licenseClasses : [],
          },
        },
      }),
    ]);

    if (!subUnit && subUnitId) {
      throw new BadRequestException(`SubUnit not exist by id:${subUnitId}.`);
    }

    if (licenseClasses?.length) {
      if (!existedLicenseClasses?.length) {
        throw new BadRequestException(
          `licenseClasses not exist by ids: [${licenseClasses.join(', ')}].`,
        );
      }
      const notFoundLicenseClasses = licenseClasses?.filter(
        (licenseClassId) => {
          return !!!existedLicenseClasses.find(
            (each) => each.id === licenseClassId,
          );
        },
      );

      if (notFoundLicenseClasses?.length) {
        throw new BadRequestException(
          `licenseClasses not exist by ids: [${notFoundLicenseClasses.join(
            ', ',
          )}].`,
        );
      }
    }
    const existingUser = await this.database.user.findFirst({
      where: {
        id,
        deleted: false,
      },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        licenseClasses: {
          select: {
            id: true,
            class: true,
          },
        },
      },
    });

    const removedLicenseClasses = existingUser?.licenseClasses?.filter(
      ({ id }) => !licenseClasses.includes(id),
    );

    const validateRoles = [
      Role.DRIVER,
      Role.PRE_APPROVED_DRIVER,
      Role.APPROVING_OFFICER,
      Role.MAC,
    ];
    const existingRoles = existingUser?.roles?.filter((role: any) =>
      validateRoles.includes(role.name),
    );

    return await this.database.user.update({
      where: {
        id,
      },
      data: {
        ...updateData,
        roles: {
          disconnect: existingRoles?.map((role) => ({
            id: role.id,
          })),
          connect: roles?.map((name) => ({
            name,
          })),
        },
        licenseClasses: {
          connect: licenseClasses?.map((id) => ({
            id,
          })),
          disconnect: removedLicenseClasses?.map(({ id }) => ({
            id,
          })),
        },
        subUnit: {
          connect: {
            id: subUnitId,
          },
        },
      },
    });
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.database.user.findFirst({
      where: {
        id,
        deleted: false,
      },
    });

    if (!result) {
      throw new BadRequestException(`user not exist by id:${id}.`);
    }

    await this.database.user.update({
      where: { id },
      data: { deleted: true },
    });

    return true;
  }

  async findOneOrCreateMicrosoftUser(email: string) {
    const user = await this.findOne(email);

    if (user) return user;
    throw new BadRequestException('User not exist!');
  }

  async getApprovingOfficers(
    name: string,
    limit = 10,
    offset = 0,
    req: Request,
  ) {
    const user = req.user as RequestedUser;

    if (!user.subUnitId) {
      throw new BadRequestException('User does not have a subunit!');
    }

    const allowedRoles = [
      'DRIVER',
      'PRE_APPROVED_DRIVER',
      'MAC',
      'APPROVING_OFFICER',
    ];
    const hasAllowedRole = user.roles.some((role) =>
      allowedRoles.includes(role),
    );

    if (!hasAllowedRole) {
      throw new BadRequestException('User does not have the required role!');
    }

    const appOfficerLIst = await this.database.user.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        subUnit: {
          id: user.subUnitId,
        },
        deleted: false,
        roles: {
          some: {
            name: Role.APPROVING_OFFICER,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
      take: limit,
      skip: offset,
    });
    return appOfficerLIst;
  }

  async findUserWithRole(id: number, role: Role) {
    const user = await this.database.user.findFirst({
      where: {
        id,
        roles: {
          some: {
            name: role,
          },
        },
      },
      include: {
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) return null;
    console.log(user, 'user');
    return user;
  }

  async findDriverRoleUsers() {
    const users = await this.database.user.findMany({
      where: {
        OR: [
          {
            roles: {
              some: {
                name: Role.DRIVER,
              },
            },
          },
          {
            roles: {
              some: {
                name: Role.PRE_APPROVED_DRIVER,
              },
            },
          },
        ],
      },
      include: {
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!users) return [];

    return users;
  }

  async validateDriverForTrip(req: Request) {
    const user = req.user as RequestedUser;

    if (!user.roles.includes(Role.DRIVER))
      return {
        message: `Please login with driver`,
        valid: false,
      };

    return {
      message: `valid driver`,
      valid: true,
    };
  }
  async validateApprovingOfficerForTrip(
    approvingOfficerId: number,
    driverId: number,
  ) {
    const approvingOfficer = await this.database.user.findFirst({
      where: {
        id: approvingOfficerId,
        roles: {
          some: {
            name: Role.APPROVING_OFFICER,
          },
        },
        subUnit: {
          drivers: {
            some: {
              id: driverId,
            },
          },
        },
      },
      include: {
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!approvingOfficer) {
      return {
        message: `Approving Officer is not valid!`,
        valid: false,
      };
    }
    return {
      message: `valid approvingOfficer`,
      valid: true,
    };
  }
}
