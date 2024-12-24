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
import { MaintenanceAdminService } from './maintenance-admin.service';
import {
  CreateMaintenanceAdminDto,
  FindManyMaintenanceAdminsDto,
  FindOneMaintenanceAdminDto,
  UpdateMaintenanceAdminDto,
} from './dto/maintenance-admin.dto';
import {
  FindManyMaintenanceAdminsResult,
  MaintenanceAdmin,
  MaintenanceAdminWithRelatedDate,
} from './entities/maintenance-admin.entities';

@Controller('maintenance-admins')
@ApiTags('Maintenance Admins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceAdminsController {
  constructor(
    private readonly maintenanceAdminService: MaintenanceAdminService,
  ) {}

  @Post()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Maintenance admin created successfully!',
    type: MaintenanceAdmin,
  })
  async create(@Body() data: CreateMaintenanceAdminDto) {
    return await this.maintenanceAdminService.create(data);
  }

  @Put()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Maintenance admin updated successfully!',
    type: MaintenanceAdmin,
  })
  async update(@Body() data: UpdateMaintenanceAdminDto) {
    return await this.maintenanceAdminService.update(data);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({
    description: 'Get list of maintenance admins successfully!',
    type: FindManyMaintenanceAdminsResult,
  })
  async getAll(@Query() query: FindManyMaintenanceAdminsDto) {
    return await this.maintenanceAdminService.findMany(query);
  }

  @Get(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Get maintenance admin by id successfully!',
    type: MaintenanceAdminWithRelatedDate,
  })
  async getOne(@Param() { id }: FindOneMaintenanceAdminDto) {
    return await this.maintenanceAdminService.findOne(Number(id));
  }

  @Delete(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Service deleted successfully!',
    type: MaintenanceAdmin,
  })
  async delete(@Param() { id }: FindOneMaintenanceAdminDto) {
    return await this.maintenanceAdminService.delete(Number(id));
  }
}
