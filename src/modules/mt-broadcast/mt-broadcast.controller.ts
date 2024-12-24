import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { MtBroadcastService } from './mt-broadcast.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { query, Request } from 'express';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { Role } from '.prisma/client';
import { MtBroadcast } from './entities/mt-broadcast.entity';
import { CreateMtBroadcastDto } from './dto/create-mt-broadcast.dto';
import {
  FindManyMTBroadcastsDto,
  FindOneMTBroadcastDto,
} from './dto/mt-broardcast.dto';
import { FindManyAuditorAdminsResult } from '../auditor-admins/entities/auditor-admins.entities';

@ApiTags('mt-broadcast')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class MtBroadcastController {
  constructor(private readonly mtBroadcastService: MtBroadcastService) {}

  @Get('mt-broadcast')
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER, Role.BASE, Role.SERVICES)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: [MtBroadcast] })
  async findAll(@Req() req: Request) {
    return await this.mtBroadcastService.findAll(req);
  }

  @Post('admin/mt-broadcast')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: MtBroadcast })
  @Roles(Role.SUPER_ADMIN, Role.BASE, Role.SERVICES)
  async create(@Body() data: CreateMtBroadcastDto) {
    return await this.mtBroadcastService.create(data);
  }

  @Get('admin/mt-broadcast')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: FindManyAuditorAdminsResult })
  @Roles(Role.SUPER_ADMIN, Role.BASE, Role.SERVICES)
  async findMany(@Query() query: FindManyMTBroadcastsDto) {
    return await this.mtBroadcastService.findMany(query);
  }

  @Get('admin/mt-broadcast/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: MtBroadcast })
  @Roles(Role.SUPER_ADMIN, Role.BASE, Role.SERVICES)
  async findOne(@Param() { id }: FindOneMTBroadcastDto) {
    return await this.mtBroadcastService.findOne(id);
  }

  @Delete('admin/mt-broadcast/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: MtBroadcast })
  @Roles(Role.SUPER_ADMIN, Role.BASE, Role.SERVICES)
  async delete(@Param() { id }: FindOneMTBroadcastDto) {
    return await this.mtBroadcastService.delete(id);
  }
}
