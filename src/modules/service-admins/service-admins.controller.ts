import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiParam, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import { CreateServiceAdminDto, FindOneServiceAdminQueryDto, GetServiceAdminsQueryDto, UpdateServiceAdminDto } from './dto/service-admins.dto';
import { ServiceAdminsService } from './service-admins.service';
import { Role } from '.prisma/client';
import { User } from '.././../core/auth/entity/loggedInUser.entity';
import { FindManyServiceAdminsResult, ServiceAdminWithRelatedData } from './entities/service-admins.entities';

@Controller('serviceAdmins')
@ApiTags('Service Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceAdminsController {
  constructor(
    private readonly serviceAdminsService: ServiceAdminsService,
  ) {}

  @Post()
  @ApiBody({ type: CreateServiceAdminDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiCreatedResponse({
    description: 'Service admin created successfully!',
    type: User,
  })
  async createServiceAdmin(
    @Body() data: CreateServiceAdminDto
  ) {
    return await this.serviceAdminsService.createServiceAdmin(data)
  }

  @Put()
  @ApiBody({ type: UpdateServiceAdminDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiCreatedResponse({
    description: 'Service admin updated successfully!',
    type: User,
  })
  async updateServiceAdmin(
    @Body() data: UpdateServiceAdminDto
  ) {
    return await this.serviceAdminsService.updateServiceAdmin(data)
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiCreatedResponse({
    description: 'Get list service admins successfully!',
    type: FindManyServiceAdminsResult
  })
  async getServiceAdmins(
    @Query() query: GetServiceAdminsQueryDto,
  ) {
    return await this.serviceAdminsService.findManyServiceAdmins(query)
  }

  @Get(':userId')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiCreatedResponse({
    description: 'Get service admin successfully!',
    type: ServiceAdminWithRelatedData,
  })
  async findOneServiceAdmin(
    @Param() { userId }: FindOneServiceAdminQueryDto
  ) {
    return await this.serviceAdminsService.findOneServiceAdmin({
      userId
    })
  }

  @Delete(':userId')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiCreatedResponse({
    description: 'Service admin updated successfully!',
    type: User,
  })
  async deleteServiceAdmin(
    @Param() { userId }: FindOneServiceAdminQueryDto
  ) {
    return await this.serviceAdminsService.deleteServiceAdmin({
      userId
    })
  }
}