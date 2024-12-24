import { Role } from '.prisma/client';
import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { Roles } from 'src/core/auth/roles/roles.decorator';
import { RolesGuard } from 'src/core/auth/roles/roles.guard';
import { generateCSV } from 'src/helpers/generateCSV';
import { ExportELogsDto, FindManyELogsDto } from './dto/eLog.dto';
import { ELogService } from './eLog.service';
import { Elog, FindManyELogsResult } from './entities/eLog.entities';

@ApiTags('eLogs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('eLogs')
export class ELogController {
  constructor(private readonly eLogService: ELogService) {}

  @Get('bos-aos-pol/vehicle')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @ApiOkResponse({ type: [Elog] })
  async findBocTrip(
    @Req() req: Request,
    @Query('vehicleId', new DefaultValuePipe(0), ParseIntPipe)
    vehicleId?: number,
  ) {
    return await this.eLogService.findBocTrip(req, vehicleId);
  }

  @Get('vehicle')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @ApiOkResponse({ type: [Elog] })
  async findAllForApprovingOfficer(
    @Req() req: Request,
    @Query('vehicleId', new DefaultValuePipe(0), ParseIntPipe)
    vehicleId?: number,
  ) {
    return await this.eLogService.findElogs(req, vehicleId);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiOkResponse({ type: FindManyELogsResult })
  async findManyELogs(
    @Query() query: FindManyELogsDto
  ) {
    return await this.eLogService.findMany(query)
  }

  @Post('exportCSV')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN)
  @ApiOkResponse({ type: FindManyELogsResult })
  async exportCSV(
    @Query() query: ExportELogsDto,
    @Response() res,
  ) {
    const eLogs = await this.eLogService.getExportData(query)

    const csvString = generateCSV(eLogs)

    const fileName = `ELogs_Book_Report_${new Date().getTime()}.csv`

    res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csvString);
  }
}
