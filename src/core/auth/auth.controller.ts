import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Response,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { AuthService } from './auth.service';
import { LocalLoginDto } from './dto/local-login.dto';
import { LoggedInUser } from './entity/loggedInUser.entity';
import { JwtQueryParamAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  //@UseGuards(AuthGuard('local')) this is not confirmed to remove from comment
  @Post('local/login')
  @ApiBody({ type: LocalLoginDto })
  @ApiCreatedResponse({
    description: 'Successfully Logged In.',
    type: LoggedInUser,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async localLogin(@Request() req: ExpressRequest) {
    return this.authService.login(req.body);
  }

  @Get('microsoft/login')
  @UseGuards(AuthGuard('azure-ad'))
  async microsoftLogin() {
    /* Redirect to MS for login */
  }

  @UseGuards(AuthGuard('azure-ad'))
  @Get('microsoft/connect')
  @ApiOkResponse({
    description: 'Successfully Logged In.',
    type: LoggedInUser,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async microsoftCallback(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ) {
    const user = await this.authService.login(req.user);
    return res.redirect(
      '/auth/microsoft/success?access_token=' + user.access_token,
    );
  }

  @UseGuards(AuthGuard('azure-ad-web'))
  @Get('microsoft/connect-web')
  @ApiOkResponse({
    description: 'Successfully Logged In.',
    type: LoggedInUser,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  async microsoftCallbackWeb(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ) {
    const user = await this.authService.login(req.user);
    return res.redirect(
      `${this.configService.get(
        'FRONT_END_HOST',
      )}/auth/microsoft/success?access_token=${user.access_token}`,
    );
  }

  @UseGuards(JwtQueryParamAuthGuard)
  @ApiOkResponse({
    description: 'Successfully Logged In.',
    type: LoggedInUser,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Get('microsoft/success')
  async loggedIn(@Request() req: ExpressRequest) {
    const user = { ...req.user } as any;

    delete user.deleted;

    return user;
  }
}
