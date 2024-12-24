import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { VehicleService } from './vehicles.service';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/auth/roles/roles.guard';
import { Vehicle } from './entity/vehicle.entity';
import { Request } from 'express';
import { VehicleLastMeterReading } from './types/VehicleLastMeterReading.type';

@ApiTags('vehicles')
@Controller('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class VechilesController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get('all')
  @ApiQuery({
    name: 'vehicleNumber',
    required: false,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: [Vehicle] })
  async findAll() {
    return await this.vehicleService.findAllVehicles();
  }

  @Get()
  @ApiQuery({
    name: 'vehicleNumber',
    required: false,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: [Vehicle] })
  async findByNumber(
    @Req() req: Request,
    @Query('vehicleNumber')
    vehicleNumber: string,
  ) {
    return await this.vehicleService.findByNumber(req, vehicleNumber);
  }

  @Get('/last-meter-reading/:vehicleNumber')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({
    type: VehicleLastMeterReading,
  })
  async getLastMeterReading(
    @Req() req: Request,
    @Param('vehicleNumber', ParseIntPipe)
    vehicleNumber: number,
  ) {
    return await this.vehicleService.getLastMeterReading(req, vehicleNumber);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: [Vehicle] })
  async findOne(
    @Req() req: Request,
    @Param('id', new DefaultValuePipe(0), ParseIntPipe) id?: number,
  ) {
    return await this.vehicleService.findOne(req, id);
  }
}
