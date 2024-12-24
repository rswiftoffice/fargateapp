import { Role } from '.prisma/client';
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Query,
  BadRequestException,
  Response, HttpStatus
} from "@nestjs/common";
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
  FindManyAuditorAdminsResultNoCount
} from "../auditor-admins/entities/auditor-admins.entities";
import { ElogBookService } from './elog-book.service';
import { ExportELogBookDto, FindManyELogBookDto } from "./dto/elog-book.dto";

@Controller('elog-book')
export class ElogBookController {
  constructor(private readonly eLogBookService: ElogBookService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SUB_UNIT, Role.BASE, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Get list elogs successfully!',
    type: FindManyAuditorAdminsResult,
  })
  async findMany(@Query() query: FindManyELogBookDto) {
    return await this.eLogBookService.findMany(query);
  }

  @Post('/get-export-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SUB_UNIT, Role.BASE, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Get list audit logs successfully!',
    type: FindManyAuditorAdminsResultNoCount,
  })
  async getExportData(@Body() body: ExportELogBookDto, @Response() res) {
    console.log('BODY', body)
    const data = await this.eLogBookService.getExportData(body);
    console.log('RESULTS', data);
    return res.status(HttpStatus.OK).json(data);
  }
}
