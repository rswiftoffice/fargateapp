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
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import { BaseService } from './base.service';
import {
  CreateBaseDto,
  FindManyBasesQueryDto,
  TransferBaseDto,
  UpdateBaseDto,
} from './dto/base.dto';
import {
  Base,
  BaseWithRelationData,
  FindManyBasesResult,
} from './entities/base.entity';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { Role } from '.prisma/client';

@ApiTags('bases')
@Controller('base')
@ApiBearerAuth()
@Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES, Role.BASE)
@UseGuards(JwtAuthGuard, RolesGuard)
export class BaseController {
  constructor(private readonly baseService: BaseService) {}

  @Post()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'Base created successfully!',
    type: Base,
  })
  async create(@Body() baseData: CreateBaseDto) {
    return await this.baseService.create(baseData);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: FindManyBasesResult })
  async findAll(@Query() query: FindManyBasesQueryDto) {
    return await this.baseService.findAll(query);
  }

  @Get(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: BaseWithRelationData })
  findOne(@Param('id') id: number) {
    return this.baseService.findOne(+id);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: Base })
  @Put()
  update(@Body() data: UpdateBaseDto) {
    return this.baseService.update(data);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: Base })
  @Put('transfer')
  transfer(@Body() data: TransferBaseDto) {
    return this.baseService.transfer(data);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: Base })
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.baseService.remove(+id);
  }
}
