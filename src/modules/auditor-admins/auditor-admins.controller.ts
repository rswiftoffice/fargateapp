import { Role } from '.prisma/client';
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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import { AuditorAdminsService } from './auditor-admins.service';
import {
  CreateAuditorAdminDto,
  FindManyAuditorAdminsQueryDto,
  FindOneAuditorAdminDto,
  UpdateAuditorAdminDto,
} from './dto/auditor-admins.dto';
import {
  AuditorAdmin,
  AuditorAdminWithRelatedData,
  FindManyAuditorAdminsResult,
} from './entities/auditor-admins.entities';

@ApiTags('Auditor admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auditorAdmins')
export class AuditorAdminController {
  constructor(private readonly auditorAdminService: AuditorAdminsService) {}

  @Post()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'AuditorAdmin created successfully!',
    type: AuditorAdmin,
  })
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() data: CreateAuditorAdminDto) {
    return await this.auditorAdminService.create(data);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: FindManyAuditorAdminsResult })
  @Get()
  @Roles(Role.SUPER_ADMIN)
  async findMany(
    @Query() query: FindManyAuditorAdminsQueryDto,
  ) {
    return await this.auditorAdminService.findManyAuditorAdmin(query);
  }


  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: AuditorAdmin })
  @Put()
  @Roles(Role.SUPER_ADMIN)
  async update(
    @Body() data: UpdateAuditorAdminDto
  ) {
    return await this.auditorAdminService.updateAuditorAdmin(data);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: AuditorAdminWithRelatedData })
  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  async getOne(
    @Param() { id }: FindOneAuditorAdminDto, 
  ) {
    return await this.auditorAdminService.findOne(+id);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: AuditorAdmin })
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  async remove(
    @Param() { id }: FindOneAuditorAdminDto, 
  ) {
    return await this.auditorAdminService.deleteAuditorAdmin(+id);
  }
}