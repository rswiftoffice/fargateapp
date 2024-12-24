import { Role } from '.prisma/client';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Put,
  Param,
  Get,
  Query,
  Response,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { Roles } from 'src/core/auth/roles/roles.decorator';
import { RolesGuard } from 'src/core/auth/roles/roles.guard';
import { generateCSV } from 'src/helpers/generateCSV';
import { BosAosPolService } from './bos-aos-pol.service';
import { CreateBosAosPolDto } from './dto/create-bos-aos-pol.dto';
import {
  ExportBosAosPolDto,
  FindManyBosAosPolDto,
  FindOneBosAosPolDto,
} from './dto/find-bos-aos-pol.dto';
import { UpdateBosAosPolDto } from './dto/update-bos-aos-pol.dto';
import {
  BosAosPol,
  FindManyBosAosPolResult,
} from './entities/bos-aos-pol.entity';

@ApiTags('bos-aos-pol')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bos-aos-pol')
export class BosAosPolController {
  constructor(private readonly bosAosPolService: BosAosPolService) {}

  @Post()
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER, Role.BASE, Role.SERVICES)
  @ApiBody({ type: CreateBosAosPolDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'Bos-Aos-Pol created successfully!',
    type: BosAosPol,
  })
  create(@Body() createBosAosPolDto: CreateBosAosPolDto, @Req() req: Request) {
    return this.bosAosPolService.create(createBosAosPolDto, req);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.BASE, Role.SERVICES, Role.SUB_UNIT)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiInternalServerErrorResponse()
  @ApiCreatedResponse({
    description: 'Bos-Aos-Pol updated successfully!',
    type: BosAosPol,
  })
  async update(
    @Param() { id }: FindOneBosAosPolDto,
    @Body() data: any,
  ) {
    return await this.bosAosPolService.update(id, data);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.BASE, Role.SERVICES, Role.SUB_UNIT)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'Get list Bos-Aos-Pol successfully!',
    type: FindManyBosAosPolResult,
  })
  async findMany(@Query() query: FindManyBosAosPolDto) {
    return await this.bosAosPolService.findMany(query);
  }

  @Post('exportCSV')
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.BASE, Role.SERVICES, Role.SUB_UNIT)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async exportCSV(@Query() query: ExportBosAosPolDto, @Response() res) {
    const bosAosPol = await this.bosAosPolService.getExportData(query);

    const csvString = generateCSV(bosAosPol);

    const fileName = `BOS_AOS_POL_Report_${new Date().getTime()}.csv`;

    res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csvString);
  }

  @Get(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.BASE, Role.SERVICES, Role.SUB_UNIT)
  @ApiOkResponse({
    description: 'get Bos details successfully!',
  })
  async getDetail(@Param() { id }: FindOneBosAosPolDto) {
    return await this.bosAosPolService.getDetails(Number(id));
  }

  @Delete(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.BASE, Role.SERVICES, Role.SUB_UNIT)
  @ApiOkResponse({
    description: 'Bos deleted successfully!',
  })
  async deleteBos(@Param() { id }: FindOneBosAosPolDto) {
    return await this.bosAosPolService.deleteBos(Number(id));
  }
}
