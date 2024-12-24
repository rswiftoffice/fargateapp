import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService, config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, provider, ...user } = await this.usersService.findOne(
      payload.username,
    );
    return user;
  }
}

@Injectable()
export class JwtQueryParamStrategy extends PassportStrategy(
  Strategy,
  'jwt-query-param',
) {
  constructor(private usersService: UsersService, config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('access_token'),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, provider, ...user } = await this.usersService.findOne(
      payload.username,
    );
    return user;
  }
}
