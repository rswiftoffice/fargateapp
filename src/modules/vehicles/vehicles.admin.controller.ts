import { Role } from '.prisma/client';
import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Query,
  Body,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import {
  CreateVehiclesDto,
  FindManyVehiclesQueryDto,
  FindOneVehicleDto,
  MakeVehicleAvailableDto,
  TransferVehicleDto,
  UpdateVehicleDto,
} from './dto/vehicles.dto';
import { FindManyVehiclesResult, Vehicle } from './entity/vehicle.entity';
import { VehicleService } from './vehicles.service';

@ApiTags('Vehicles Portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/admin/vehicles')
export class VehiclesAdminController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'Vehicle created successfully!',
    type: Vehicle,
  })
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  async create(@Body() data: CreateVehiclesDto) {
    return await this.vehicleService.createVehicle(data);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: FindManyVehiclesResult })
  @Get()
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  async findMany(@Query() query: FindManyVehiclesQueryDto) {
    return await this.vehicleService.findManyVehicles(query);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: Vehicle })
  @Put('transfer')
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  async transfer(@Body() data: TransferVehicleDto) {
    return await this.vehicleService.transferVehicle(data);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: Boolean })
  @Put('makeAvailable')
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  async makeAvailable(@Body() data: MakeVehicleAvailableDto) {
    return await this.vehicleService.makeVehicleAvailable(data);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: Vehicle })
  @Put()
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  async update(@Body() data: UpdateVehicleDto) {
    return await this.vehicleService.updateVehicle(data);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: Vehicle })
  @Get(':id')
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  async getOne(@Param() { id }: FindOneVehicleDto) {
    return await this.vehicleService.findOneForAdmin(+id);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: Vehicle })
  @Delete(':id')
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  async remove(@Param() { id }: FindOneVehicleDto) {
    return await this.vehicleService.deleteVehicle(+id);
  }
}
