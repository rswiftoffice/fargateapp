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
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import { ServicesService } from '../services/services.service';
import { CommandsService } from './commands.service';
import {
  CreateCommandDto,
  FindManyCommandsDto,
  TransferCommandDto,
  UpdateCommandDto,
} from './dto/commands.dto';
import { Role } from '.prisma/client';
import {
  Commands,
  CommandWithRelatedService,
  FindManyCommandsResult,
} from './entities/commands.entities';

@ApiTags('Commands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('commands')
export class CommandsController {
  constructor(
    private readonly commandsService: CommandsService,
    private readonly servicesService: ServicesService,
  ) {}

  @Post()
  @ApiBody({ type: CreateCommandDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Command created successfully!',
    type: Commands,
  })
  async createCommand(@Body() data: CreateCommandDto) {
    await this.servicesService.findOneService(data?.serviceId);

    return await this.commandsService.createCommands(data);
  }

  @Get()
  @ApiQuery({ type: FindManyCommandsDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES, Role.BASE)
  @ApiOkResponse({
    description: 'Get list commands successfully!',
    type: FindManyCommandsResult,
  })
  async getCommands(@Query() query: FindManyCommandsDto) {
    return await this.commandsService.findAll(query);
  }

  @Get(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiOkResponse({
    description: 'Get command successfully!',
    type: CommandWithRelatedService,
  })
  async getOneCommand(@Param() { id }) {
    return await this.commandsService.findOneCommands(Number(id));
  }

  @Put(':id')
  @ApiBody({ type: UpdateCommandDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiOkResponse({
    description: 'Update command successfully!',
    type: Commands,
  })
  async updateCommand(@Param() { id }, @Body() data: UpdateCommandDto) {
    return await this.commandsService.updateCommands(Number(id), data);
  }

  @Delete(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiOkResponse({
    description: 'Deleted command successfully!',
    type: Boolean,
  })
  async deleteCommand(@Param() { id }) {
    return await this.commandsService.deleteOneCommands(Number(id));
  }

  @Post('transfer')
  @ApiBody({ type: TransferCommandDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES)
  @ApiOkResponse({
    description: 'Update command successfully!',
    type: Commands,
  })
  async transferCommand(@Body() data: TransferCommandDto) {
    return await this.commandsService.transferCommand(data);
  }
}
