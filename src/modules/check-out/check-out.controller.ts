import { Role } from '.prisma/client';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Response,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { Roles } from 'src/core/auth/roles/roles.decorator';
import { RolesGuard } from 'src/core/auth/roles/roles.guard';
import { CheckOutService } from './check-out.service';
import { ExportCheckOutsDto, FindManyCheckOutsDto } from './dto/check-out.dto';
import { CreateCheckOutDto } from './dto/create-check-out.dto';
import {
  CheckOut,
  FindManyCheckOutsResult,
  FindManyCheckOutsResultNoCount,
} from './entities/check-out.entity';

@ApiTags('check-out')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('check-out')
export class CheckOutController {
  constructor(private readonly checkOutService: CheckOutService) {}

  @Post()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'Sub-Unit created successfully!',
    type: CheckOut,
  })
  @Roles(Role.MAC)
  async create(
    @Body() createCheckOutDto: CreateCheckOutDto,
    @Req() req: Request,
  ) {
    return await this.checkOutService.create(createCheckOutDto, req);
  }

  @Get()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'get list checkouts successfully!',
    type: FindManyCheckOutsResult,
  })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SUB_UNIT, Role.SERVICES, Role.BASE)
  async findMany(@Query() query: FindManyCheckOutsDto) {
    return await this.checkOutService.findMany(query);
  }

  @Post('/get-export-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.SUB_UNIT, Role.SERVICES, Role.COMMAND)
  @ApiCreatedResponse({
    description: 'Get list check-in successfully!',
    type: FindManyCheckOutsResultNoCount,
  })
  async getExportData(@Body() body: ExportCheckOutsDto, @Response() res) {
    const data = await this.checkOutService.exportCSV(body);
    return res.status(HttpStatus.OK).json(data);
  }
}
