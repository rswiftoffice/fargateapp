import { Role } from '.prisma/client';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
  Query,
  Response,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { query, Request } from 'express';
import { Roles } from 'src/core/auth/roles/roles.decorator';
import { RolesGuard } from 'src/core/auth/roles/roles.guard';
import { CheckInService } from './check-in.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';

import {
  CheckIn,
  FindManyCheckInsResult,
  FindManyCheckInsResultNoCount,
} from './entities/check-in.entity';
import { CreateUpdatesDto } from '../updates/dto/create-update.dto';
import { Vehicle } from '../vehicles/entity/vehicle.entity';
import { FormDataRequest } from 'nestjs-form-data';

import * as fs from 'fs-extra';
import { ExportCheckInDto, FindManyCheckInDto } from './dto/check-in-dto';
@ApiTags('check-in')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('check-in')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  @ApiBody({ type: CreateCheckInDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'Check-In created successfully!',
    type: CreateCheckInDto,
  })
  @FormDataRequest()
  @Roles(Role.MAC)
  async createPreventive(@Body() body: any, @Req() req: Request) {
    try {
      const checkIn = await this.checkInService.create(body, req);

      return checkIn;
    } catch (e) {
      //Delete all files

      body.images?.forEach(async (image) => {
        if (image) await fs.remove(image.path);
      });

      throw e;
    }
  }

  @Get('vehicles')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: Vehicle })
  @Roles(Role.MAC)
  async findAll(@Req() req: Request) {
    return await this.checkInService.findAllVehicles(req);
  }

  @Get(':vehicleId')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: CheckIn })
  @ApiParam({
    name: 'vehicleId',
    required: true,
  })
  @Roles(Role.MAC)
  findOne(
    @Param('vehicleId', new DefaultValuePipe(0), ParseIntPipe)
    vehicleId: number,
    @Req() req: Request,
  ) {
    return this.checkInService.findOne(vehicleId, req);
  }

  @Get('updates/:vehicleServiceingId')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: CheckIn })
  @ApiParam({
    name: 'vehicleServiceingId',
    required: true,
  })
  @Roles(Role.MAC)
  async FindUpdateLogOfCheckIns(
    @Param('vehicleServiceingId', new DefaultValuePipe(0), ParseIntPipe)
    vehicleServiceingId: number,
    @Req() req: Request,
  ) {
    return await this.checkInService.FindUpdateLogOfCheckIns(
      vehicleServiceingId,
      req,
    );
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: CreateUpdatesDto })
  @Post('update-logs')
  @Roles(Role.MAC)
  CreateUpdateLogOfCheckIns(
    @Body() body: CreateUpdatesDto,
    @Req() req: Request,
  ) {
    return this.checkInService.CreateUpdateLogOfCheckIns(body, req);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: FindManyCheckInsResult })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SUB_UNIT, Role.SERVICES, Role.BASE)
  async findMany(@Query() query: FindManyCheckInDto) {
    return await this.checkInService.findMany(query);
  }

  @Post('/get-export-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.SUB_UNIT, Role.SERVICES, Role.COMMAND)
  @ApiCreatedResponse({
    description: 'Get list check-in successfully!',
    type: FindManyCheckInsResultNoCount,
  })
  async getExportData(@Body() body: ExportCheckInDto, @Response() res) {
    const data = await this.checkInService.exportCSV(body);
    return res.status(HttpStatus.OK).json(data);
  }
}
