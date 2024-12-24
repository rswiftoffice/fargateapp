import {
  ApprovalStatus,
  DestinationStatus,
  MTRACFormStatus,
  Role,
  TripApprovalStatus,
  TripStatus,
} from '.prisma/client';

import * as _ from 'lodash';

import { BadRequestException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { DatabaseService } from 'src/core/database/database.service';

import {
  AdHocDestinationDTO,
  EndDestinationDto,
  StartDestinationDto,
} from '../destinations/dto/updateDestination.dto';
import { RequestedUser } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { VehicleService } from '../vehicles/vehicles.service';
import {
  CreateTripDto,
  CreateTripWithoutMTRACFormDto,
} from './dto/create-trip.dto';
import { UpdateTripApprovedDto, UpdateTripDto } from './dto/update-trip.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import * as moment from 'moment';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class TripService {
  constructor(
    private database: DatabaseService,
    private usersService: UsersService,
    private vehicleService: VehicleService,
    private auditLogService: AuditLogService,
    private firebaseService: FirebaseService,
  ) {}

  async create(body: CreateTripDto, req: Request) {
    try {
      const {
        tripDate,
        aviDate,
        approvingOfficer,
        destinations,
        vehicle,
        MTRACForm,
        isTripFromPreApprovedDriver,
        currentMeterReading,
      } = body;

      const driver = req.user as RequestedUser;

      const {
        overAllRisk,
        dispatchTime,
        dispatchDate,
        releaseDate,
        releaseTime,
        isAdditionalDetailApplicable,
        driverRiskAssessmentChecklist,
        otherRiskAssessmentChecklist,
        rankAndName,
        personalPin,
        filledBy,
        quizzes,
      } = MTRACForm;
      console.log(body, '====body', MTRACForm);
      //check valid preApproved Driver

      if (!isTripFromPreApprovedDriver && !approvingOfficer) {
        throw new BadRequestException(
          'Please enter approvingOfficer with id like approvingOfficer:1 !',
        );
      }
      if (
        isTripFromPreApprovedDriver &&
        !driver.roles.includes(Role.PRE_APPROVED_DRIVER)
      ) {
        throw new BadRequestException(
          'You are not authorized to create trip because you have not Pre Approved Driver Role',
        );
      }

      //check APPROVING_OFFICER exists when driver
      // check APPROVING_OffICER is same subunit of driver

      if (!isTripFromPreApprovedDriver) {
        const validApprovindOfficer =
          await this.usersService.validateApprovingOfficerForTrip(
            approvingOfficer,
            driver.id,
          );

        if (!validApprovindOfficer.valid) {
          throw new BadRequestException(validApprovindOfficer.message);
        }
      }

      // check Vehicle exists
      // check Vehicle is same subunit of driver
      //remove check Vehicle is already assigned to any trip

      // const validVehicle =
      //   await this.vehicleService.validateVehicleForTripWithoutCheckAvailablity(
      //     driver,
      //     vehicle,
      //   );

      // if (!validVehicle.valid) {
      //   throw new BadRequestException(validVehicle.message);
      // }

      const trip = await this.database.trip.create({
        data: {
          tripDate,
          aviDate,
          currentMeterReading,
          ...(!isTripFromPreApprovedDriver
            ? {
                approvingOfficer: {
                  connect: {
                    id: approvingOfficer,
                  },
                },
              }
            : { approvalStatus: ApprovalStatus.Approved }),
          vehicle: {
            connect: {
              id: vehicle,
            },
          },
          driver: {
            connect: {
              id: driver.id,
            },
          },
          destinations: {
            createMany: {
              data: destinations.map(({ to, requisitionerPurpose }) => ({
                to,
                requisitionerPurpose,
                ...(isTripFromPreApprovedDriver
                  ? {
                      approvalStatus: ApprovalStatus.Approved,
                    }
                  : {}),
              })),
            },
          },
          MTRACForm: {
            create: {
              overAllRisk,
              dispatchTime,
              dispatchDate,
              releaseDate,
              releaseTime,
              isAdditionalDetailApplicable,
              driverRiskAssessmentChecklist,
              otherRiskAssessmentChecklist,
              rankAndName,
              personalPin,
              filledBy,
              status: MTRACFormStatus.Review,
              quizzes: {
                createMany: {
                  data: quizzes,
                },
              },
            },
          },
        },
      });
      if (trip) {
        const auditLogDate = moment(trip.createdAt).format('DD/MM/YYYY hh:mm');

        await this.auditLogService.create({
          addedBy: driver.id,
          currentRole: driver.roles.includes('PRE_APPROVED_DRIVER')
            ? 'PRE_APPROVED_DRIVER'
            : 'DRIVER',
          description: `${auditLogDate} Trip "${trip.id}" has been CREATED by User (${driver.name})!`,
          name: driver.name,
        });

        if (!isTripFromPreApprovedDriver) {
          await this.firebaseService.sendMessageToTopic({
            topic: `User-${approvingOfficer}`,
            notification: {
              body: `Trip "${driver.name}" has requested to initiate a trip`,
              title: `New trip initiated`,
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
            data: {
              tripId: trip.id.toString(),
            },
          });
        }
      }
      delete trip.deleted;
      return trip;
    } catch (err) {
      console.log(err, '===rr');
    }
  }

  async WithoutMTRACForm(body: CreateTripWithoutMTRACFormDto, req: Request) {
    try {
      const {
        tripDate,
        aviDate,
        approvingOfficer,
        destinations,
        vehicle,
        isTripFromPreApprovedDriver,
      } = body;

      const driver = req.user as RequestedUser;

      //check valid preApproved Driver

      if (!isTripFromPreApprovedDriver && !approvingOfficer) {
        throw new BadRequestException(
          'Please enter approvingOfficer with id like approvingOfficer:1 !',
        );
      }
      if (
        isTripFromPreApprovedDriver &&
        !driver.roles.includes(Role.PRE_APPROVED_DRIVER)
      ) {
        throw new BadRequestException(
          'You are not authorized to create trip because you have not Pre Approved Driver Role',
        );
      }

      //check APPROVING_OFFICER exists when driver
      // check APPROVING_OffICER is same subunit of driver

      if (!isTripFromPreApprovedDriver) {
        const validApprovindOfficer =
          await this.usersService.validateApprovingOfficerForTrip(
            approvingOfficer,
            driver.id,
          );

        if (!validApprovindOfficer.valid) {
          throw new BadRequestException(validApprovindOfficer.message);
        }
      }

      // check Vehicle exists
      // check Vehicle is same subunit of driver
      // check Vehicle is already assigned to any trip

      const validVehicle =
        await this.vehicleService.validateVehicleForTripWithoutCheckAvailablity(
          driver,
          vehicle,
        );

      if (!validVehicle.valid) {
        throw new BadRequestException(validVehicle.message);
      }

      const trip = await this.database.trip.create({
        data: {
          tripDate,
          aviDate,
          // currentMeterReading,
          ...(!isTripFromPreApprovedDriver
            ? {
                approvingOfficer: {
                  connect: {
                    id: approvingOfficer,
                  },
                },
              }
            : { approvalStatus: ApprovalStatus.Approved }),
          vehicle: {
            connect: {
              id: vehicle,
            },
          },
          driver: {
            connect: {
              id: driver.id,
            },
          },
          destinations: {
            createMany: {
              data: destinations.map(({ to, requisitionerPurpose }) => ({
                to,
                requisitionerPurpose,
                ...(isTripFromPreApprovedDriver
                  ? {
                      approvalStatus: ApprovalStatus.Approved,
                    }
                  : {}),
              })),
            },
          },
        },
      });

      if (trip) {
        const auditLogDate = moment(trip.createdAt).format('DD/MM/YYYY hh:mm');

        await this.auditLogService.create({
          addedBy: driver.id,
          currentRole: driver.roles.includes('PRE_APPROVED_DRIVER')
            ? 'PRE_APPROVED_DRIVER'
            : 'DRIVER',
          description: `${auditLogDate} Trip "${trip.id}" has been CREATED by User (${driver.name})!`,
          name: driver.name,
        });

        if (!isTripFromPreApprovedDriver) {
          await this.firebaseService.sendMessageToTopic({
            topic: `User-${approvingOfficer}`,
            notification: {
              body: `Trip "${driver.name}" has requested to initiate a trip`,
              title: `New trip initiated`,
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
            data: {
              tripId: trip.id.toString(),
            },
          });
        }
      }
      delete trip.deleted;
      return trip;
    } catch (err) {
      console.log(err, '===');
    }
  }

  async approved(body: UpdateTripApprovedDto, req: Request) {
    const user = req.user as RequestedUser;
    //tripValidation

    const { tripId, safetyMeasures } = body;
    const tripValidate = await this.database.trip.findFirst({
      where: { deleted: false, id: tripId, approvingOfficerId: user.id },
      include: {
        MTRACForm: true,
      },
    });

    if (!tripValidate)
      throw new BadRequestException(
        `The trip with id ${tripId} does not exist or you are not authorized to approve that trip!`,
      );
    if (
      tripValidate.approvalStatus === ApprovalStatus.Approved ||
      tripValidate.approvalStatus === ApprovalStatus.Rejected
    ) {
      throw new BadRequestException(
        `This trip is already ${tripValidate.approvalStatus}!`,
      );
    }
    //update trip approval status and all destination approval status
    const trip = await this.database.trip.update({
      data: {
        approvalStatus: TripApprovalStatus.Approved,
        destinations: {
          updateMany: {
            data: {
              approvalStatus: ApprovalStatus.Approved,
            },
            where: {
              tripId: tripId,
            },
          },
        },
        ...(tripValidate.MTRACForm && {
          MTRACForm: {
            update: {
              safetyMeasures,
            },
          },
        }),
      },
      where: {
        id: tripId,
      },
    });
    if (trip) {
      const auditLogDate = moment(trip.updatedAt).format('DD/MM/YYYY hh:mm');

      await this.auditLogService.create({
        addedBy: user.id,
        currentRole: 'APPROVING_OFFICER',
        description: `${auditLogDate} Trip "${trip.id}" has been APPROVED by User (${user.name})!`,
        name: user.name,
      });
    }
    delete trip.deleted;
    return trip;
  }

  async reject(tripId: number, req: Request) {
    const user = req.user as RequestedUser;
    //tripValidation
    const tripValidate = await this.database.trip.findFirst({
      where: { deleted: false, id: tripId, approvingOfficerId: user.id },
    });

    if (!tripValidate)
      throw new BadRequestException(
        `The trip with id ${tripId} does not exist or you are not authorized to approve that trip!`,
      );
    if (
      tripValidate.approvalStatus === ApprovalStatus.Approved ||
      tripValidate.approvalStatus === ApprovalStatus.Rejected
    ) {
      throw new BadRequestException(
        `This trip is already ${tripValidate.approvalStatus}!`,
      );
    }
    //update trip approval status and all destination approval status
    const trip = await this.database.trip.update({
      data: {
        approvalStatus: TripApprovalStatus.Rejected,
        destinations: {
          updateMany: {
            data: {
              approvalStatus: ApprovalStatus.Rejected,
            },
            where: {
              tripId: tripId,
            },
          },
        },
      },
      where: {
        id: tripId,
      },
    });
    if (trip) {
      const auditLogDate = moment(trip.updatedAt).format('DD/MM/YYYY hh:mm');

      await this.auditLogService.create({
        addedBy: user.id,
        currentRole: 'APPROVING_OFFICER',
        description: `${auditLogDate} Trip "${trip.id}" has been REJECT by User (${user.name})!`,
        name: user.name,
      });
    }
    delete trip.deleted;
    return trip;
  }

  async startDestination(body: StartDestinationDto, req: Request) {
    try {
      const { currentMeterReading, destinationId, startTime } = body;
      const user = req.user as RequestedUser;

      // find destination valid or not
      const destination = await this.database.destination.findFirst({
        where: {
          id: destinationId,
          deleted: false,
        },
        include: {
          trip: true,
        },
      });

      if (!destination) throw new BadRequestException(`Destination not found!`);

      //check user is valid for this destination
      const validUser = await this.database.trip.findFirst({
        where: {
          driverId: user.id,
          id: destination.tripId,
          deleted: false,
        },
      });
      if (!validUser)
        throw new BadRequestException(
          'This destination is not belong to userId ' + user.id,
        );

      //check destination is already in progress
      if (destination.status === DestinationStatus.InProgress)
        throw new BadRequestException(
          'This destination is already in progress!',
        );

      //check destination is already completed
      if (destination.status === DestinationStatus.Completed)
        throw new BadRequestException('This destination is already Completed!');

      const validVehicle =
        await this.vehicleService.validateAvailablityForDestination(
          user,
          destination.trip.vehiclesId,
          destination.trip.id,
        );

      if (!validVehicle.valid) {
        throw new BadRequestException(validVehicle.message);
      }

      //check add-hoc destination approved or not

      const adHoc = await this.database.destination.findFirst({
        where: {
          id: destinationId,
          isAdHocDestination: true,
          deleted: false,
        },
      });

      if (adHoc && adHoc.approvalStatus === ApprovalStatus.Rejected)
        throw new BadRequestException(
          'AdHOC destination is rejected by the Approving-officer!',
        );

      if (adHoc && adHoc.approvalStatus !== ApprovalStatus.Approved) {
        throw new BadRequestException('AdHOC destination is not approved!');
      }

      // check trip approval status is approved
      const approvedTrip = await this.database.trip.findFirst({
        where: {
          id: destination.tripId,
          deleted: false,
        },
        include: {
          vehicle: true,
        },
      });

      if (approvedTrip.approvalStatus === 'Rejected')
        throw new BadRequestException(`Trip is Rejected by approving-Officer!`);

      if (approvedTrip.approvalStatus !== 'Approved')
        throw new BadRequestException(
          `Trip is not approved by approving-Officer!`,
        );

      const oneDestinationIsAlreadtInProgress =
        await this.database.destination.findFirst({
          where: {
            tripId: approvedTrip.id,
            status: DestinationStatus.InProgress,
            deleted: false,
          },
        });

      if (oneDestinationIsAlreadtInProgress)
        throw new BadRequestException(
          `One destination is already in progress!`,
        );

      const getCurrentMeterReading = await this.database.eLog.findFirst({
        where: {
          destinationId: destinationId,
          deleted: false,
        },
      });
      if (!!getCurrentMeterReading) {
        if (
          parseFloat(currentMeterReading.toFixed(2)) !==
          parseFloat(getCurrentMeterReading.meterReading.toFixed(2))
        ) {
          await this.database.eLog.update({
            where: {
              destinationId: destinationId,
            },
            data: {
              meterReading: currentMeterReading,
            },
          });
        }
      }

      console.log(
        'START DESTINATION  current Meter Reading=>',
        currentMeterReading,
      );
      // update trip status and currentMeterReading
      const [tripUpdate, destinationUpdate, elogCreated] =
        await this.database.$transaction([
          this.database.trip.update({
            data: {
              currentMeterReading,
              tripStatus: TripStatus.InProgress,
              ...(approvedTrip.tripStatus === TripStatus.Inactive
                ? { currentMeterReading }
                : {}),
            },
            where: {
              id: destination.tripId,
            },
          }),
          this.database.destination.update({
            data: {
              status: DestinationStatus.InProgress,
            },
            where: {
              id: destinationId,
            },
          }),
          this.database.eLog.create({
            data: {
              meterReading: currentMeterReading, // parseFloat(currentMeterReading.toFixed(2)),
              totalDistance: 0,
              startTime,
              destination: {
                connect: {
                  id: destinationId,
                },
              },
            },
          }),
        ]);
      if (tripUpdate && destinationUpdate && elogCreated) {
        const auditLogDate = moment(elogCreated.createdAt).format(
          'DD/MM/YYYY hh:mm',
        );

        await this.auditLogService.create({
          addedBy: user.id,
          currentRole: user.roles.includes('PRE_APPROVED_DRIVER')
            ? 'PRE_APPROVED_DRIVER'
            : 'DRIVER',
          description: `${auditLogDate} Destination "${destinationUpdate.id}" has been Started by User (${user.name})!`,
          name: user.name,
        });
      }
      delete tripUpdate.deleted;
      delete destinationUpdate.deleted;
      delete elogCreated.deleted;
      return { tripUpdate, destinationUpdate, elogCreated };
    } catch (error) {
      console.log('error----', error);
      throw new BadRequestException(error);
    }
  }

  async endDestination(body: EndDestinationDto, req: Request) {
    const { currentMeterReading, destinationId, ELog, details } = body;
    const user = req.user as RequestedUser;
    try {
      const {
        endTime,
        requisitionerPurpose,
        totalDistance,
        fuelReceived,
        fuelType,
        stationaryRunningTime,
        POSONumber,
        remarks,
      } = ELog;
      console.log(totalDistance, '===totalDistance dfgdfg dfgd fg');
      // find destination valid or not
      const destination = await this.database.destination.findFirst({
        where: {
          id: destinationId,
          deleted: false,
        },
      });

      if (!destination) throw new BadRequestException(`Destination not found`);

      //check user is valid for this destination
      const validUser = await this.database.trip.findFirst({
        where: {
          driverId: user.id,
          id: destination.tripId,
          deleted: false,
        },
      });
      if (!validUser)
        throw new BadRequestException('user is not valid to start destination');

      //check destination is already in completed
      if (destination.status === DestinationStatus.Completed)
        throw new BadRequestException('This destination is already completed!');

      // check trip approval status is approved
      const approvedTrip = await this.database.trip.findFirst({
        where: {
          id: destination.tripId,
          approvalStatus: TripApprovalStatus.Approved,
          deleted: false,
        },
      });

      if (!approvedTrip)
        throw new BadRequestException(`trip is not approved by admin!`);

      const Elog = await this.database.eLog.findFirst({
        where: {
          destinationId: destination.id,
          deleted: false,
        },
      });
      if (!Elog)
        throw new BadRequestException(
          `Elog is not found by destinationId: ${destinationId}!`,
        );
      // update trip status and currentMeterReading
      const getTripId = await this.database.destination.findFirst({
        where: {
          id: destinationId,
        },
      });
      console.log(
        totalDistance,
        'END DESTINATION  current Meter Reading=>',
        currentMeterReading,
      );
      await this.database.trip.update({
        data: {
          currentMeterReading: currentMeterReading,
        },
        where: {
          id: getTripId.tripId,
        },
      });
      const [updatedDestination, eLogUpdated] =
        await this.database.$transaction([
          this.database.destination.update({
            data: {
              status: DestinationStatus.Completed,
              details,
            },
            where: {
              id: destinationId,
            },
          }),
          this.database.eLog.update({
            data: {
              endTime,
              requisitionerPurpose,
              totalDistance: totalDistance,
              fuelReceived,
              fuelType,
              stationaryRunningTime,
              meterReading: currentMeterReading,
              POSONumber,
              remarks,
            },
            where: {
              id: Elog.id,
            },
          }),
        ]);
      if (updatedDestination && eLogUpdated) {
        const auditLogDate = moment(eLogUpdated.updatedAt).format(
          'DD/MM/YYYY hh:mm',
        );
        const da = await this.database.eLog.findFirst({
          where: {
            id: Elog.id,
          },
        });
        console.log(da, '==datt');
        await this.auditLogService.create({
          addedBy: user.id,
          currentRole: user.roles.includes('PRE_APPROVED_DRIVER')
            ? 'PRE_APPROVED_DRIVER'
            : 'DRIVER',
          description: `${auditLogDate} Destination "${updatedDestination.id}" has been ENDED by User (${user.name})!`,
          name: user.name,
        });
      }
      delete updatedDestination.deleted;
      delete eLogUpdated.deleted;

      return { updatedDestination, eLogUpdated };
    } catch (error) {
      console.log('error----', error);
      throw new BadRequestException(error);
    }
  }

  async addHocDestination(body: AdHocDestinationDTO, req: Request) {
    const { details, requisitionerPurpose, to, tripId } = body;
    const user = req.user as RequestedUser;

    const trip = await this.database.trip.findFirst({
      where: {
        id: tripId,
        driverId: user.id,
        deleted: false,
      },
    });

    if (!trip) throw new BadRequestException('Not valid trip!');

    const adHocDestination = await this.database.destination.create({
      data: {
        requisitionerPurpose,
        to,
        details,
        isAdHocDestination: true,
        trip: {
          connect: {
            id: tripId,
          },
        },
        ...(trip.approvingOfficerId
          ? {
              approvingOfficer: {
                connect: {
                  id: trip.approvingOfficerId,
                },
              },
            }
          : {
              approvalStatus: ApprovalStatus.Approved,
            }),
      },
    });

    if (adHocDestination) {
      const auditLogDate = moment(adHocDestination.createdAt).format(
        'DD/MM/YYYY hh:mm',
      );

      await this.auditLogService.create({
        addedBy: user.id,
        currentRole: !trip.approvingOfficerId
          ? 'PRE_APPROVED_DRIVER'
          : 'DRIVER',
        description: `${auditLogDate} AdHOC-Destination "${adHocDestination.id}" has been CREATED by User (${user.name})!`,
        name: user.name,
      });
    }
    delete adHocDestination.deleted;
    return adHocDestination;
  }

  async approveAdHoc(id: number, req: Request) {
    const user = req.user as RequestedUser;

    const validDestination = await this.database.destination.findFirst({
      where: {
        id,
        approvingOfficerId: user.id,
        deleted: false,
      },
    });

    if (!validDestination) {
      throw new BadRequestException('Destination is not valid to update!');
    }

    if (validDestination.approvalStatus === ApprovalStatus.Rejected)
      throw new BadRequestException(
        'Destination is already rejected by approving-officer!',
      );

    if (validDestination.approvalStatus === ApprovalStatus.Approved)
      throw new BadRequestException('Destination is already approved');

    const adHoc = await this.database.destination.update({
      where: {
        id,
      },
      data: {
        approvalStatus: ApprovalStatus.Approved,
      },
    });
    if (adHoc) {
      const auditLogDate = moment(adHoc.updatedAt).format('DD/MM/YYYY hh:mm');

      await this.auditLogService.create({
        addedBy: user.id,
        currentRole: 'APPROVING_OFFICER',
        description: `${auditLogDate} AdHOC-Destination "${adHoc.id}" has been APPROVED by User (${user.name})!`,
        name: user.name,
      });
    }
    delete adHoc.deleted;
    return adHoc;
  }

  async updateLastMeterReading(id: number, reading: number, req: Request) {
    // const user = req.user as RequestedUser;
    const validTrip = await this.database.trip.findFirst({
      where: {
        id: id,
        approvalStatus: ApprovalStatus.Approved,
        deleted: false,
      },
    });

    if (!validTrip) {
      throw new BadRequestException('Trip is not valid to update!');
    }

    const adHoc = await this.database.trip.update({
      where: {
        id,
        approvalStatus: ApprovalStatus.Approved,
      },
      data: {
        currentMeterReading: reading,
      },
    });

    return adHoc;
  }
  async rejectAdHoc(id: number, req: Request) {
    const user = req.user as RequestedUser;

    const validDestination = await this.database.destination.findFirst({
      where: {
        id,
        approvingOfficerId: user.id,
        deleted: false,
      },
    });

    if (!validDestination) {
      throw new BadRequestException('Destination is not valid to update!');
    }
    if (validDestination.approvalStatus === ApprovalStatus.Approved)
      throw new BadRequestException('Destination is already approved!');

    if (validDestination.approvalStatus === ApprovalStatus.Rejected)
      throw new BadRequestException(
        'Destination is already rejected by approving-officer!',
      );

    const adHoc = await this.database.destination.update({
      where: {
        id,
      },
      data: {
        approvalStatus: ApprovalStatus.Rejected,
      },
    });
    if (adHoc) {
      const auditLogDate = moment(adHoc.updatedAt).format('DD/MM/YYYY hh:mm');

      await this.auditLogService.create({
        addedBy: user.id,
        currentRole: 'APPROVING_OFFICER',
        description: `${auditLogDate} AdHOC-Destination "${adHoc.id}" has been APPROVED by User (${user.name})!`,
        name: user.name,
      });
    }
    delete adHoc.deleted;
    return adHoc;
  }

  async findAdHocDestinationsDriver(req: Request) {
    const user = req.user as RequestedUser;

    if (!user.roles.includes(Role.DRIVER))
      throw new BadRequestException(
        "You are not authorized to acceess driver's AdHOC-destinations!",
      );
    const destinations = await this.database.destination.findMany({
      where: {
        trip: {
          driverId: user.id,
          deleted: false,
        },
        isAdHocDestination: true,
        approvalStatus: ApprovalStatus.Pending,
        deleted: false,
      },
    });
    return _.map(destinations, (destination) =>
      _.omit(destination, ['deleted']),
    );
  }

  async findAdHocDestinationsApprovingOfficer(req: Request) {
    const user = req.user as RequestedUser;
    if (!user.roles.includes(Role.DRIVER))
      throw new BadRequestException(
        "You are not authorized to acceess Approving-Officer's AdHOC-destinations!",
      );
    const destinations = await this.database.destination.findMany({
      where: {
        approvingOfficerId: user.id,
        isAdHocDestination: true,
        approvalStatus: ApprovalStatus.Pending,
        deleted: false,
      },
    });

    return _.map(destinations, (destination) =>
      _.omit(destination, ['deleted']),
    );
  }

  async tripsDetail(req: Request, tripId?: number) {
    const user = req.user as RequestedUser;

    if (
      !user.roles.includes(Role.DRIVER) &&
      !user.roles.includes(Role.PRE_APPROVED_DRIVER) &&
      !user.roles.includes(Role.APPROVING_OFFICER)
    )
      throw new BadRequestException(
        'You do not have required roles to access trip details. (Driver, Pre Approved Driver or Approving Officer roles can access trip details)',
      );

    const trip = await this.database.trip.findFirst({
      where: {
        id: tripId === 0 ? undefined : tripId,
        deleted: false,
        OR: [
          {
            driverId: user.id,
          },
          {
            approvingOfficerId: user.id,
          },
        ],
      },
      include: {
        MTRACForm: {
          include: {
            quizzes: true,
          },
        },
        approvingOfficer: true,
        destinations: {
          include: {
            eLog: {
              select: {
                id: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
        driver: true,
        vehicle: true,
      },
    });

    if (tripId !== 0 && !trip)
      throw new BadRequestException(
        'Trip not found or you are not authorized to access other driver`s trip!',
      );

    return trip;
  }

  async findAllForDriver(
    req: Request,
    status?: TripStatus,
    approvalStatus?: ApprovalStatus,
  ) {
    const user = req.user as RequestedUser;
    if (!user.roles.includes(Role.DRIVER))
      throw new BadRequestException(
        "you are not authorized by driver role so, you can`t access driver's trips",
      );
    const trips = await this.database.trip.findMany({
      where: {
        tripStatus: status,
        approvalStatus,
        driverId: user.id,
        deleted: false,
      },
      include: {
        MTRACForm: true,
        destinations: {
          include: {
            eLog: {
              select: {
                id: true,
                startTime: true,
                endTime: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const structuredTrips = trips.map((trip) => {
      return {
        ...trip,

        ...(trip.MTRACForm
          ? {
              riskAssessment: trip.MTRACForm.overAllRisk,
            }
          : {
              riskAssessment: null,
            }),

        MTRACForm: undefined,
      };
    });

    return _.map(structuredTrips, (trip) => _.omit(trip, ['deleted']));
  }

  async findAllForApprovingOfficer(
    req: Request,
    status?: TripStatus,
    approvalStatus?: ApprovalStatus,
  ) {
    const user = req.user as RequestedUser;
    if (!user.roles.includes(Role.APPROVING_OFFICER))
      throw new BadRequestException(
        "you are not authorized by Approving-Officer's role so, you can`t access Approving-Officer's trips",
      );
    const trips = await this.database.trip.findMany({
      where: {
        tripStatus: status,
        approvalStatus,
        approvingOfficerId: user.id,
        deleted: false,
      },
      include: {
        driver: true,
        vehicle: {
          include: {
            platforms: {
              include: {
                licenseClass: true,
              },
            },
          },
        },
        MTRACForm: true,
        destinations: true,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });

    const structuredTrips = trips.map((trip) => {
      return {
        ...trip,
        driverName: trip.driver.name,
        vehicleNumber: trip.vehicle.vehicleNumber,
        ...(trip.MTRACForm
          ? {
              riskAssessment: trip.MTRACForm.overAllRisk,
              safetyMeasures: trip.MTRACForm.safetyMeasures,
            }
          : {
              riskAssessment: null,
              safetyMeasures: null,
            }),
        vehicleLicenceNumber: trip.vehicle.platforms.licenseClass.class,
        vehicleType: trip.vehicle.vehicleType,
        platforms: undefined,
        driver: undefined,
        vehicle: undefined,
        MTRACForm: undefined,
      };
    });

    return _.map(structuredTrips, (trip) => _.omit(trip, ['deleted']));
  }

  async updateTripCompleted(id: number, req: Request) {
    const user = req.user as RequestedUser;

    const validTrip = await this.database.trip.findFirst({
      where: {
        id,
        driverId: user.id,
        deleted: false,
      },
    });

    if (!validTrip) throw new BadRequestException('trip is not valid!');

    const alreadyCompleted = await this.database.trip.findFirst({
      where: {
        id,
        driverId: user.id,
        tripStatus: TripStatus.Completed,
        deleted: false,
      },
    });

    if (alreadyCompleted)
      throw new BadRequestException('trip is already completed!');

    const inCompleteDestination = await this.database.trip.findFirst({
      where: {
        id,
        destinations: {
          some: {
            NOT: [{ status: DestinationStatus.Completed }],
          },
        },
        deleted: false,
      },
    });

    if (inCompleteDestination)
      throw new BadRequestException('please complete all Destinations!');

    const trip = await this.database.trip.update({
      where: {
        id: id,
      },
      data: {
        tripStatus: TripStatus.Completed,
        endedAt: new Date().toISOString(),
      },
    });
    if (trip) {
      const auditLogDate = moment(trip.updatedAt).format('DD/MM/YYYY hh:mm');

      await this.auditLogService.create({
        addedBy: user.id,
        currentRole: user.roles.includes('PRE_APPROVED_DRIVER')
          ? 'PRE_APPROVED_DRIVER'
          : 'DRIVER',
        description: `${auditLogDate} Trip "${trip.id}" has been COMPLETED by User (${user.name})!`,
        name: user.name,
      });
    }
    delete trip.deleted;
    return trip;
  }

  async updateTripCancel(id: number, req: Request) {
    const user = req.user as RequestedUser;

    const validTrip = await this.database.trip.findFirst({
      where: {
        id,
        driverId: user.id,
        deleted: false,
      },
    });

    if (!validTrip) throw new BadRequestException('trip is not valid!');

    const alreadyCancelled = await this.database.trip.findFirst({
      where: {
        id,
        driverId: user.id,
        tripStatus: TripStatus.Cancelled,
        deleted: false,
      },
    });

    if (alreadyCancelled)
      throw new BadRequestException('Trip is already Cancelled!');

    const alreadyCompleted = await this.database.trip.findFirst({
      where: {
        id,
        driverId: user.id,
        tripStatus: TripStatus.Completed,
        deleted: false,
      },
    });

    if (alreadyCompleted)
      throw new BadRequestException('Trip is already Completed!');

    const trip = await this.database.trip.update({
      where: {
        id: id,
      },
      data: {
        tripStatus: TripStatus.Cancelled,
        endedAt: new Date().toISOString(),
      },
    });
    if (trip) {
      const auditLogDate = moment(trip.updatedAt).format('DD/MM/YYYY hh:mm');

      await this.auditLogService.create({
        addedBy: user.id,
        currentRole: user.roles.includes('PRE_APPROVED_DRIVER')
          ? 'PRE_APPROVED_DRIVER'
          : 'DRIVER',
        description: `${auditLogDate} Trip "${trip.id}" has been CANCLED by User (${user.name})!`,
        name: user.name,
      });
    }
    delete trip.deleted;
    return trip;
  }

  async update(id: number, data: UpdateTripDto) {
    const trip = await this.database.trip.update({
      where: {
        id: id,
      },
      data,
    });

    return trip;
  }

  async remove(id: number) {
    const trip = await this.database.trip.delete({
      where: {
        id: id,
      },
    });

    return trip;
  }
}
