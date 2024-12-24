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
import { BaseAdminService } from './base-admin.service';
import {
  CreateBaseAdminDto,
  FindManyBaseAdminsDto,
  FindOneBaseAdminQueryDto,
  UpdateBaseAdminDto,
} from './dto/base-admin.dto';
import {
  BaseAdminWithRelatedData,
  FindManyBaseAdminsResult,
} from './entities/base-admin.entities';

@Controller('baseAdmins')
@ApiTags('Base Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class BaseAdminsController {
  constructor(private readonly baseAdminsService: BaseAdminService) {}

  @Post()
  @ApiBody({ type: CreateBaseAdminDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Base admin created successfully!',
    type: User,
  })
  async createBaseAdmin(@Body() data: CreateBaseAdminDto) {
    return await this.baseAdminsService.create(data);
  }

  @Put()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Base admin updated successfully!',
    type: User,
  })
  async updateBaseAdmin(@Body() data: UpdateBaseAdminDto) {
    return await this.baseAdminsService.update(data);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Get list base admins successfully!',
    type: FindManyBaseAdminsResult,
  })
  async getBaseAdmins(@Query() query: FindManyBaseAdminsDto) {
    return await this.baseAdminsService.findMany(query);
  }

  @Get(':userId')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Get base admin successfully!',
    type: BaseAdminWithRelatedData,
  })
  async findOneBaseAdmin(@Param() { userId }: FindOneBaseAdminQueryDto) {
    return await this.baseAdminsService.findOne(Number(userId));
  }

  @Delete(':userId')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Base admin deleted successfully!',
    type: User,
  })
  async deleteBaseAdmin(@Param() { userId }: FindOneBaseAdminQueryDto) {
    return await this.baseAdminsService.delete(Number(userId));
  }
}
