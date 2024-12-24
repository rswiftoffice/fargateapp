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
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import { CommandAdminsService } from './command-admins.service';
import {
  CreateCommandAdminDto,
  UpdateCommandAdminDto,
  GetListCommandAdminsQueryDto,
} from './dto/command-admins.dto';
import { Role } from '.prisma/client';
import {
  CommandAdminWithRelatedData,
  FindManyCommandAdminsResult,
} from './entities/command-admins.entities';
import { User } from '../../core/auth/entity/loggedInUser.entity';

@ApiTags('CommandAdmins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('commandAdmins')
export class CommandAdminsController {
  constructor(private readonly commandAdminsService: CommandAdminsService) {}

  @Post()
  @ApiBody({ type: CreateCommandAdminDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Command admin created successfully!',
    type: User,
  })
  async createCommand(@Body() data: CreateCommandAdminDto) {
    return await this.commandAdminsService.createCommandAdmin(data);
  }

  @Get()
  @ApiQuery({ type: GetListCommandAdminsQueryDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiOkResponse({
    description: 'Get list command admins successfully!',
    type: FindManyCommandAdminsResult,
  })
  async getCommandAdmins(@Query() query: GetListCommandAdminsQueryDto) {
    return await this.commandAdminsService.findManyCommandAdmins(query);
  }

  @Get(':userId')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiOkResponse({
    description: 'Get command admin successfully!',
    type: CommandAdminWithRelatedData,
  })
  async getOneCommand(@Param() { userId }) {
    return await this.commandAdminsService.findOneCommandAdmin(Number(userId));
  }

  @Put()
  @ApiBody({ type: UpdateCommandAdminDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiOkResponse({
    description: 'Update command successfully!',
    type: User,
  })
  async updateCommand(@Body() data: UpdateCommandAdminDto) {
    return await this.commandAdminsService.updateCommandAdmin(data);
  }

  @Delete(':userId')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiOkResponse({
    description: 'Deleted command admin successfully!',
    type: Boolean,
  })
  async deleteCommand(@Param() { userId }) {
    return await this.commandAdminsService.deleteCommandAdmin(Number(userId));
  }
}
