import { Role } from '.prisma/client';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import { CreateServiceDto, FindManyServicesDto, IdentityDto, TransferServiceDto, UpdateServiceDto } from './dto/services.dto';
import { FindManyServicesResult, Services } from './entities/services.entities';
import { ServicesService } from './services.service';

@Controller('services')
@ApiTags('Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
  ) {}

  @Post()
  @ApiBody({ type: CreateServiceDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiCreatedResponse({
    description: 'Service created successfully!',
    type: Services,
  })
  async createService(
    @Body() data: CreateServiceDto,
  ) {
    return await this.servicesService.createService(data)
  }

  @Put('/transfer')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiCreatedResponse({
    description: 'Service transferred successfully!',
    type: Services,
  })
  async transferService(
    @Body() data: TransferServiceDto,
  ) {
    return await this.servicesService.transfer(data)
  }

  @Put()
  @ApiBody({ type: UpdateServiceDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiCreatedResponse({
    description: 'Service updated successfully!',
    type: Services,
  })
  async updateService(
    @Body() data: UpdateServiceDto,
  ) {
    return await this.servicesService.updateService(data)
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({
    description: 'Get list of services successfully!',
    type: FindManyServicesResult,
  })
  async getAllServices(
    @Query()  query: FindManyServicesDto,
  ) {
    return await this.servicesService.findServices(query)
  }

  @Get(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiCreatedResponse({
    description: 'Get service by id successfully!',
    type: Services,
  })
  async getOneService(
    @Param() { id }: IdentityDto
  ) {
    return await this.servicesService.findOneService(Number(id))
  }

  @Delete(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiCreatedResponse({
    description: 'Service deleted successfully!',
    type: Services,
  })
  async deleteService(
    @Param() { id }: IdentityDto,
  ) {
    return await this.servicesService.deleteOneService(Number(id))
  }
}

