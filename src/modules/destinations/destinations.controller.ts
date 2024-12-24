import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/core/auth/roles/roles.decorator';
import { DestinationsService } from './destinations.service';
import { FindManyDestinationDTO } from './dto/destination.dto';
import { UpdateOneDTO } from './dto/updateDestination.dto';

@Controller('destinations')
export class DestinationsController {
  constructor(private destinationsService: DestinationsService) {}

  @Get()
  @ApiQuery({ type: FindManyDestinationDTO })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.SERVICES)
  @ApiOkResponse({
    description: 'Get list destinations successfully!',
  })
  async getDestinations(@Query() query: FindManyDestinationDTO) {
    return await this.destinationsService.findAll(query);
  }

  @Put(':id')
  @ApiBody({ type: UpdateOneDTO })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.SERVICES)
  @ApiOkResponse({
    description: 'Update destination successfully!',
  })
  async updateDestination(@Param() { id }, @Body() data: UpdateOneDTO) {
    return await this.destinationsService.updateOne(Number(id), data);
  }

  @Get(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.SERVICES)
  @ApiOkResponse({
    description: 'get detail destination successfully!',
  })
  async getDetail(@Param() { id }) {
    return await this.destinationsService.getDetails(Number(id));
  }
}
