import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/auth/roles/roles.guard';
import { PerformanceCardService } from './performance-card.service';
import { Request, Response } from 'express';
import { DownloadPerformanceCardDTO } from './dto/performance-card.dto';
import { Roles } from 'src/core/auth/roles/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('performance-card')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('performance-card')
export class PerformanceCardController {
  constructor(
    private readonly performanceCardService: PerformanceCardService,
  ) {}

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse()
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @Get()
  findAll(@Req() req: Request) {
    return this.performanceCardService.findAllPerformanceCards(req);
  }

  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiOkResponse()
  @ApiBody({ type: DownloadPerformanceCardDTO })
  @Roles(Role.DRIVER, Role.PRE_APPROVED_DRIVER)
  @Post('download')
  async download(
    @Body() body: DownloadPerformanceCardDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const csv = await this.performanceCardService.download(body, req);

    res.set({
      'Content-Disposition': `attachment; filename="performance.csv"`,
    });

    res.send(csv);
  }
}
