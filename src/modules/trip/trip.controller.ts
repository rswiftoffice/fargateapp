/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Req,
} from '@nestjs/common';
import { TripService } from './trip.service';
import {
  CreateTripDto,
  CreateTripWithoutMTRACFormDto,
} from './dto/create-trip.dto';
import { UpdateTripApprovedDto } from './dto/update-trip.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Trip } from './entities/trip.entity';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/auth/roles/roles.guard';
import { Roles } from 'src/core/auth/roles/roles.decorator';
import { ApprovalStatus, Role, TripStatus } from '.prisma/client';
import { Request } from 'express';
import { Destination } from '../destinations/entities/destination.entity';
import {
  AdHocDestinationDTO,
  EndDestinationDto,
  StartDestinationDto,
} from '../destinations/dto/updateDestination.dto';

@ApiTags('trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @ApiBody({ type: CreateTripWithoutMTRACFormDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @ApiCreatedResponse({
    description: 'Trip created successfully!',
    type: Trip,
  })
  async WithoutMTRACForm(
    @Body() createTripDto: CreateTripWithoutMTRACFormDto,
    @Req() req: Request,
  ) {
    return await this.tripService.WithoutMTRACForm(createTripDto, req);
  }

  @Post('/mtrac-form')
  @ApiBody({ type: CreateTripDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @ApiCreatedResponse({
    description: 'Trip created successfully!',
    type: Trip,
  })
  async create(@Body() createTripDto: CreateTripDto, @Req() req: Request) {
    return await this.tripService.create(createTripDto, req);
  }

  @Roles(Role.APPROVING_OFFICER)
  @Post('approve')
  @ApiBody({ type: UpdateTripApprovedDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'Trip approved successfully!',
    type: Trip,
  })
  async tripApprovalStatus(
    @Body() createTripDto: UpdateTripApprovedDto,
    @Req() req: Request,
  ) {
    return await this.tripService.approved(createTripDto, req);
  }

  @Roles(Role.APPROVING_OFFICER)
  @Patch('reject/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'Trip approved successfully!',
    type: Trip,
  })
  @ApiParam({
    name: 'id',
    required: true,
  })
  async tripRejectStatus(
    @Req() req: Request,
    @Param('id', new DefaultValuePipe(0), ParseIntPipe) id?: number,
  ) {
    return await this.tripService.reject(id, req);
  }

  @Get('driver')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @ApiOkResponse({ type: [Trip] })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TripStatus,
  })
  @ApiQuery({
    name: 'approvalStatus',
    required: false,
    enum: ApprovalStatus,
  })
  async findAllForDriver(
    @Req() req: Request,
    @Query('status') status: TripStatus,
    @Query('approvalStatus') approvalStatus: ApprovalStatus,
  ) {
    return await this.tripService.findAllForDriver(req, status, approvalStatus);
  }

  @Get('approving-officer')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.APPROVING_OFFICER)
  @ApiOkResponse({ type: [Trip] })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TripStatus,
  })
  @ApiQuery({
    name: 'approvalStatus',
    required: false,
    enum: ApprovalStatus,
  })
  async findAllForApprovingOfficer(
    @Req() req: Request,
    @Query('status') status: TripStatus,
    @Query('approvalStatus') approvalStatus: ApprovalStatus,
  ) {
    return await this.tripService.findAllForApprovingOfficer(
      req,
      status,
      approvalStatus,
    );
  }

  @Post('start-destination')
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @ApiBody({ type: StartDestinationDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'Destination started successfully!',
    type: Destination,
  })
  async startDestination(
    @Body() StartDestinationDto: StartDestinationDto,
    @Req() req: Request,
  ) {
    return await this.tripService.startDestination(StartDestinationDto, req);
  }

  @Patch('update-last-meter-reading/:id/:reading')
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @Roles(Role.APPROVING_OFFICER)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiParam({
    name: 'id',
    required: true,
  })
   @ApiParam({
    name: 'reading',
    required: true,
  })
  async updateLastMeterReading(
    @Req() req: Request,
    @Param('id',new DefaultValuePipe(0), ParseIntPipe) id?: number,
    @Param('reading',new DefaultValuePipe(0), ParseIntPipe) reading?: number,
  ) {
    return await this.tripService.updateLastMeterReading(id,reading, req);
  }
  @Post('end-destination')
  @ApiBody({ type: EndDestinationDto })
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'Destination end successfully!',
    type: Destination,
  })
  async tripEndDestination(
    @Body() EndDestinationDto: EndDestinationDto,
    @Req() req: Request,
  ) {
    return await this.tripService.endDestination(EndDestinationDto, req);
  }

  @Get('adHoc-destination/driver')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @ApiOkResponse({ type: Trip })
  async findAdHocDestinationsDriver(@Req() req: Request) {
    return await this.tripService.findAdHocDestinationsDriver(req);
  }

  @Get('adHoc-destination/approving-officer')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.APPROVING_OFFICER)
  @ApiOkResponse({ type: Trip })
  async findAdHocDestinationsApprovingOfficer(@Req() req: Request) {
    return await this.tripService.findAdHocDestinationsApprovingOfficer(req);
  }

  @Post('adHoc-destination')
  @ApiBody({ type: AdHocDestinationDTO })
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'AdHOC Destination added successfully!',
    type: Destination,
  })
  async tripAddHocDestination(
    @Body() AdHocDestinationDTO: AdHocDestinationDTO,
    @Req() req: Request,
  ) {
    return await this.tripService.addHocDestination(AdHocDestinationDTO, req);
  }

  @Patch('approve/adHoc-destination/:id')
  @Roles(Role.APPROVING_OFFICER)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiParam({
    name: 'id',
    required: true,
  })
  @ApiCreatedResponse({
    description: 'AdHOC Destination Approved successfully!',
    type: Destination,
  })
  async approveAdHoc(
    @Req() req: Request,
    @Param('id', new DefaultValuePipe(0), ParseIntPipe) id?: number,
  ) {
    return await this.tripService.approveAdHoc(id, req);
  }

  @Patch('reject/adHoc-destination/:id')
  @Roles(Role.APPROVING_OFFICER)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiParam({
    name: 'id',
    required: true,
  })
  @ApiCreatedResponse({
    description: 'AdHOC Destination Approved successfully!',
    type: Destination,
  })
  async rejectAdHoc(
    @Req() req: Request,
    @Param('id', new DefaultValuePipe(0), ParseIntPipe) id?: number,
  ) {
    return await this.tripService.rejectAdHoc(id, req);
  }

  @Patch('end/:id')
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: Trip })
  @ApiParam({
    name: 'id',
    required: true,
  })
  async updateTripCompleted(
    @Req() req: Request,
    @Param('id', new DefaultValuePipe(0), ParseIntPipe) id?: number,
  ) {
    return await this.tripService.updateTripCompleted(id, req);
  }

  @Patch('cancel/:id')
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: Trip })
  @ApiParam({
    name: 'id',
    required: true,
  })
  async updateTripCancel(
    @Req() req: Request,
    @Param('id', new DefaultValuePipe(0), ParseIntPipe) id?: number,
  ) {
    return await this.tripService.updateTripCancel(id, req);
  }

  @Get(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER, Role.APPROVING_OFFICER)
  @ApiOkResponse({ type: Trip })
  @ApiParam({
    name: 'id',
    required: false,
  })
  async tripDetail(
    @Req() req: Request,
    @Param('id', new DefaultValuePipe(0), ParseIntPipe) id?: number,
  ) {
    return await this.tripService.tripsDetail(req, id);
  }
}
