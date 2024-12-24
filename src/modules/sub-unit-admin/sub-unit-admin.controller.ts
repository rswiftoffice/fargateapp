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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import { Role } from '.prisma/client';
import { User } from '.././../core/auth/entity/loggedInUser.entity';
import { SubUnitAdminsService } from './sub-unit-admin.service';
import {
  CreateSubUnitAdminDto,
  FindManySubUnitAdminsQuery,
  FindOneSubUnitAdminQueryDto,
  UpdateSubUnitAdminDto,
} from './dto/sub-unit-admin.dto';
import {
  FindManySubUnitAdminsResult,
  SubUnitAdminWithRelatedData,
} from './entities/sub-unit-admin.entities';

@Controller('subUnitAdmins')
@ApiTags('Sub Unit Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubUnitAdminsController {
  constructor(private readonly subUnitAdminsService: SubUnitAdminsService) {}

  @Post()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.BASE, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Sub unit admin created successfully!',
    type: User,
  })
  async createSubUnitAdmin(@Body() data: CreateSubUnitAdminDto) {
    return await this.subUnitAdminsService.create(data);
  }

  @Put()
  @ApiBody({ type: UpdateSubUnitAdminDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.BASE, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Sub unit admin updated successfully!',
    type: User,
  })
  async updateSubUnitAdmin(@Body() data: UpdateSubUnitAdminDto) {
    return await this.subUnitAdminsService.update(data);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.BASE, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Get list service admins successfully!',
    type: FindManySubUnitAdminsResult,
  })
  async getSubUnitAdmins(@Query() query: FindManySubUnitAdminsQuery) {
    return await this.subUnitAdminsService.findMany(query);
  }

  @Get(':userId')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.BASE, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Get service admin successfully!',
    type: SubUnitAdminWithRelatedData,
  })
  async findOneSubUnitAdmin(@Param() { userId }: FindOneSubUnitAdminQueryDto) {
    return await this.subUnitAdminsService.findOne(userId);
  }

  @Delete(':userId')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.BASE, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Sub unit admin updated successfully!',
    type: User,
  })
  async deleteSubUnitAdmin(@Param() { userId }: FindOneSubUnitAdminQueryDto) {
    return await this.subUnitAdminsService.delete(userId);
  }
}
