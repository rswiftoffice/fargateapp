import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Response,
  UseGuards,
} from '@nestjs/common';
import { VehicleServicingService } from './vehicle-servicing.service';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/auth/roles/roles.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from 'src/core/auth/roles/roles.decorator';
import { CheckInOutType, Role } from '.prisma/client';
import {
  FindManyVehicleServicingResult, FindManyVehicleServicingResultNoCount,
  VehicleServicing
} from "./entities/vehicle-servicing.entity";
import {
  ExportVehicleServicingDto,
  FindManyVehicleServicesDto,
} from './dto/vehicle-servicing.dto';

@ApiTags('vehicle-servicing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicle-servicing')
export class VehicleServicingController {
  constructor(
    private readonly vehicleServicingService: VehicleServicingService,
  ) {}

  @Get('driver')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.DRIVER)
  @ApiOkResponse({ type: VehicleServicing })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CheckInOutType,
  })
  async findAllByDriver(
    @Req() req: Request,
    @Query('type') type: CheckInOutType,
  ) {
    return await this.vehicleServicingService.findAllByDriver(req, type);
  }

  @Get('mac')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.MAC)
  @ApiOkResponse({ type: VehicleServicing })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: CheckInOutType,
  })
  async findAllByMac(@Req() req: Request, @Query('type') type: CheckInOutType) {
    return await this.vehicleServicingService.findAllByMac(req, type);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SUB_UNIT, Role.BASE, Role.SERVICES)
  @ApiOkResponse({ type: FindManyVehicleServicingResult })
  async findMany(@Query() query: FindManyVehicleServicesDto) {
    return await this.vehicleServicingService.findMany(query);
  }

  @Post('/get-export-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SUB_UNIT, Role.BASE, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Get list mtrac form logs successfully!',
    type: FindManyVehicleServicingResultNoCount,
  })
  async getExportData(
    @Body() body: ExportVehicleServicingDto,
    @Response() res,
  ) {
    const data = await this.vehicleServicingService.exportCSV(body);
    return res.status(HttpStatus.OK).json(data);
  }
}
