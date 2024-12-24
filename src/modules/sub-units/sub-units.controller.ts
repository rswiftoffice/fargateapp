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
import {
  CreateSubUnitDto,
  FindManySubUnitsQueryDto,
  TransferSubUnitDto,
  UpdateSubUnitDto,
} from './dto/subUnit.dto';
import { FindManySubUnitsResult, SubUnit } from './entities/sub-unit.entity';
import { SubUnitsService } from './sub-units.service';

@ApiTags('sub-units')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subUnits')
export class SubUnitsController {
  constructor(private readonly subUnitsService: SubUnitsService) {}

  @Post()
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiCreatedResponse({
    description: 'Sub-Unit created successfully!',
    type: SubUnit,
  })
  @Roles(Role.SUPER_ADMIN, Role.COMMAND, Role.SERVICES, Role.BASE)
  async create(@Body() body: CreateSubUnitDto) {
    return await this.subUnitsService.create(body);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: FindManySubUnitsResult })
  @Get()
  async findMany(@Query() query: FindManySubUnitsQueryDto) {
    return await this.subUnitsService.findMany(query);
  }

  @Get(':id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: SubUnit })
  async findOne(@Param('id') id: string) {
    return await this.subUnitsService.findOne(+id);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: SubUnit })
  @Put('transfer')
  async transfer(@Body() data: TransferSubUnitDto) {
    return await this.subUnitsService.transfer(data);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse({ type: SubUnit })
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateSubUnitDto) {
    return await this.subUnitsService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.subUnitsService.delete(+id);
  }
}
