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
  FindManyAuditorAdminsResultNoCount
} from "../auditor-admins/entities/auditor-admins.entities";
import { AuditLogService } from './audit-log.service';
import { ExportAuditLogsDto, FindManyAuditLogsDto } from './dto/audit-logs.dto';
import { AuditLog } from './entities/audit-log.entity';

@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  create(@Body() createAuditLogDto: AuditLog) {
    return this.auditLogService.create(createAuditLogDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiCreatedResponse({
    description: 'Get list audit logs successfully!',
    type: FindManyAuditorAdminsResult,
  })
  async findMany(@Query() query: FindManyAuditLogsDto) {
    return await this.auditLogService.findMany(query);
  }

  @Post('/get-export-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiCreatedResponse({
    description: 'Get list audit logs successfully!',
    type: FindManyAuditorAdminsResultNoCount,
  })
  async getExportData(@Body() body: ExportAuditLogsDto, @Response() res) {
    const data = await this.auditLogService.getExportData(body);
    return res.status(HttpStatus.OK).json(data);
  }
}
