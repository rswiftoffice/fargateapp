import { Role } from '.prisma/client';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import { VehiclePlatformsService } from './vehicle-platforms.service';
import {
  FindManyVehiclePlatformsResult,
  VehiclePlatform,
  VehiclePlatformWithRelatedData,
} from './entities/vehicle-platforms.entities';
import {
  CreateVehiclePlatformDto,
  FindOneVehiclePlatformDto,
  UpdateVehiclePlatformDto,
} from './dto/vehicle-platforms.dto';
import { FindManyVehiclesQueryDto } from '../vehicles/dto/vehicles.dto';

@Controller('vehicle-platforms')
@ApiTags('Vehicle Platforms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclePlatformsController {
  constructor(
    private readonly vehiclePlatformService: VehiclePlatformsService,
  ) {}

  @Post()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  @ApiCreatedResponse({
    description: 'Vehicle platform created successfully!',
    type: VehiclePlatform,
  })
  async createVehiclePlatform(@Body() data: CreateVehiclePlatformDto) {
    return await this.vehiclePlatformService.create(data);
  }

  @Put()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  @ApiCreatedResponse({
    description: 'Vehicle platform updated successfully!',
    type: VehiclePlatform,
  })
  async updateVehiclePlatform(@Body() data: UpdateVehiclePlatformDto) {
    return await this.vehiclePlatformService.update(data);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({
    description: 'Get list of vehicle platforms successfully!',
    type: FindManyVehiclePlatformsResult,
  })
  async getVehiclePlatforms(@Query() query: FindManyVehiclesQueryDto) {
    return await this.vehiclePlatformService.findMany(query);
  }

  @Get(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  @ApiCreatedResponse({
    description: 'Get VehiclePlatform by id successfully!',
    type: VehiclePlatformWithRelatedData,
  })
  async getOneVehiclePlatform(@Param() { id }: FindOneVehiclePlatformDto) {
    return await this.vehiclePlatformService.findOne(Number(id));
  }

  @Delete(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  @ApiCreatedResponse({
    description: 'VehiclePlatform deleted successfully!',
    type: VehiclePlatform,
  })
  async deleteVehiclePlatform(@Param() { id }: FindOneVehiclePlatformDto) {
    return await this.vehiclePlatformService.delete(Number(id));
  }
}
