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
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import {
  CreateLicenseClassDto,
  FindManyLicenseClassesQueryDto,
  FindOneLicenseClassDto,
  UpdateLicenseClassDto,
} from './dto/license-classes.dto';
import {
  FindManyLicenseClassesResult,
  LicenseClasses,
} from './entities/license-classes.entity';
import { LicenseClassesService } from './license-classes.service';

@ApiTags('license-classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('license-classes')
export class LicenseClassesController {
  constructor(private readonly licenseClassesService: LicenseClassesService) {}

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: LicenseClasses })
  @ApiQuery({
    name: 'name',
    required: false,
  })
  @Get('all')
  findAll(
    @Query('name')
    name: string,
  ) {
    return this.licenseClassesService.findAll(name);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: FindManyLicenseClassesResult })
  @Get()
  async findMany(@Query() query: FindManyLicenseClassesQueryDto) {
    return await this.licenseClassesService.findMany(query);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: LicenseClasses })
  @Post()
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  async create(@Body() data: CreateLicenseClassDto) {
    return await this.licenseClassesService.create(data);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: LicenseClasses })
  @Put()
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  async update(@Body() data: UpdateLicenseClassDto) {
    return await this.licenseClassesService.update(data);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: LicenseClasses })
  @Get(':id')
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  async findOne(@Param() { id }: FindOneLicenseClassDto) {
    return await this.licenseClassesService.findOne(id);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: LicenseClasses })
  @Delete(':id')
  @Roles(
    Role.SUPER_ADMIN,
    Role.COMMAND,
    Role.BASE,
    Role.SERVICES,
    Role.SUB_UNIT,
  )
  async deleteOne(@Param() { id }: FindOneLicenseClassDto) {
    return await this.licenseClassesService.delete(id);
  }
}
