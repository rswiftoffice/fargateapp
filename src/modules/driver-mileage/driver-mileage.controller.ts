import { Role } from '.prisma/client';
import {
  Controller,
  UseGuards,
  Get,
  Query,
  Post,
  Response,
  Body,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import { DriverMileageService } from './driver-mileage.service';
import {
  ExportDriverMileagesDto,
  FindManyDriverMileagesDto,
} from './dto/driver-mileage.dto';
import {
  FindManyDriverMileagesResult,
  FindManyDriverMileagesResultNoCount,
} from './entities/driver-mileage.entites';

@ApiTags('Driver Mileage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('driver-mileage')
export class DriverMileageController {
  constructor(private readonly driverMileageService: DriverMileageService) {}

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'get list driver mileages successfully!',
    type: FindManyDriverMileagesResult,
  })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SUB_UNIT, Role.BASE, Role.SERVICES)
  async findMany(@Query() query: FindManyDriverMileagesDto) {
    return await this.driverMileageService.findMany(query);
  }

  @Post('/get-export-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SUB_UNIT, Role.BASE, Role.SERVICES)
  @ApiCreatedResponse({
    description: 'Get list mtrac form logs successfully!',
    type: FindManyDriverMileagesResultNoCount,
  })
  async getExportData(@Body() body: ExportDriverMileagesDto, @Response() res) {
    const data = await this.driverMileageService.exportCSV(body);
    return res.status(HttpStatus.OK).json(data);
  }
}
