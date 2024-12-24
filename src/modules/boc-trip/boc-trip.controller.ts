import { Role } from '.prisma/client';
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
  BadRequestException,
  Response,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { generateCSV } from '../../helpers/generateCSV';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import {
  FindManyAuditorAdminsResult,
  FindManyAuditorAdminsResultNoCount,
} from '../auditor-admins/entities/auditor-admins.entities';
import { BocTripService } from './boc-trip.service';
import { ExportBocTripDto, FindManyBocTripDto } from './dto/boc-trip.dto';

@Controller('boc-trip')
export class BocTripController {
  constructor(private readonly bocTripService: BocTripService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES, Role.SUB_UNIT, Role.BASE)
  @ApiCreatedResponse({
    description: 'Get list BOC Trip successfully!',
    type: FindManyAuditorAdminsResult,
  })
  async findMany(@Query() query: FindManyBocTripDto) {
    return await this.bocTripService.findMany(query);
  }

  @Post('/get-export-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES, Role.SUB_UNIT, Role.BASE)
  @ApiCreatedResponse({
    description: 'Get list audit logs successfully!',
    type: FindManyAuditorAdminsResultNoCount,
  })
  async getExportData(@Body() body: ExportBocTripDto, @Response() res) {
    const data = await this.bocTripService.getExportData(body);
    return res.status(HttpStatus.OK).json(data);
  }
}
