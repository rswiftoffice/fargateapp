import { Role } from '.prisma/client';
import {
  Body,
  Controller,
  Get, HttpStatus,
  Post,
  Req,
  Query,
  Response,
  UseGuards
} from "@nestjs/common";
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../core/auth/roles/roles.decorator';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/roles/roles.guard';
import { ExportMTRACFormDto, FindManyMTRACFormDto } from './dto/mtrac-form.dto';
import { MTRACFormService } from './mtrac-form.service';
import { FindManyMTRACFormResult, FindManyMTRACFormResultNoCount } from "./entities/mtrac-form.entities";

@ApiTags('MTRAC Form')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mtrac-form')
export class MTRACFormController {
  constructor(private readonly mtracFormService: MTRACFormService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES, Role.SUB_UNIT, Role.BASE)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'Get list MTRAC forms successfully!',
    type: FindManyMTRACFormResult,
  })
  async findMany(@Req() req: Request, @Query() query: FindManyMTRACFormDto) {
    return await this.mtracFormService.findMany(req, query);
  }

  @Post('/get-export-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES, Role.SUB_UNIT, Role.BASE)
  @ApiCreatedResponse({
    description: 'Get list mtrac form logs successfully!',
    type: FindManyMTRACFormResultNoCount,
  })
  async getExportData(@Body() body: ExportMTRACFormDto, @Response() res) {
    const data = await this.mtracFormService.getExportData(body);
    return res.status(HttpStatus.OK).json(data);
  }
}
