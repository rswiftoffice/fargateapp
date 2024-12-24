import { PrismaClient, Role } from '@prisma/client';

import * as bcrypt from 'bcrypt';

const db = new PrismaClient();

/* Creating Roles */
const createRoles = async () => {
  await db.roles.createMany({
    data: [
      ...Object.keys(Role).map((role: Role) => ({
        name: role,
      })),
    ],
  });
  console.log('Roles Created Successfully!');
};

// /* Create First Super Admin User */
const createFirstSuperAdmin = async () => {
  const email = process.env.FIRST_SUPER_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.FIRST_SUPER_ADMIN_PASSWORD || 'admin123';

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      name: 'Super Admin',
      email,
      username: email,
      password: hashedPassword,
      roles: {
        connect: {
          name: Role.SUPER_ADMIN,
        },
      },
    },
  });
  console.log('Super Admin Created Successfully!');
};

const createTestData = async () => {
  await db.service.create({
    data: {
      name: 'Test Service',
      description: 'Test Service Description',
      commands: {
        create: {
          name: 'Test Command',
          description: 'Test Command Description',
          bases: {
            create: {
              name: 'Test Base',
              description: 'Test Base Description',
              subUnits: {
                create: {
                  name: 'Test Sub Unit',
                  description: 'Test Sub Unit Description',
                  vehicles: {
                    create: {
                      isServiceable: false,
                      model: 'Test Vehicle Model',
                      vehicleNumber: 'Test Vehicle Number',
                      vehicleType: 'Vehicle',
                      platforms: {
                        create: {
                          name: 'Test Platform',
                          licenseClass: {
                            create: {
                              class: 'Test Class',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  console.log('Test Data Created Successfully!');
};

const main = async () => {
  await createRoles();
  await createFirstSuperAdmin();
  process.env.NODE_ENV === 'test' && (await createTestData());
};

main();
