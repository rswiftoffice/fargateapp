import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OIDCStrategy, IOIDCStrategyOption } from 'passport-azure-ad';
import { UsersService } from 'src/modules/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureADStrategy extends PassportStrategy(
  OIDCStrategy,
  'azure-ad',
) {
  constructor(private usersService: UsersService, config: ConfigService) {
    super(<IOIDCStrategyOption>{
      identityMetadata: `https://login.microsoftonline.com/${config.get(
        'AUTH_AD_TENANT_ID',
      )}/v2.0/.well-known/openid-configuration`,
      clientID: config.get('AUTH_AD_CLIENT_ID'),
      clientSecret: config.get('AUTH_AD_CLIENT_SECRET'),
      redirectUrl:
        config.get('AUTH_AD_REDIRECT_DOMAIN') + '/auth/microsoft/connect',
      //allowHttpForRedirectUrl: process.env.NODE_ENV !== 'production',
      allowHttpForRedirectUrl: true,
      responseMode: 'query',
      validateIssuer: false,
      responseType: 'code',
      passReqToCallback: true,
      scope: ['openid', 'email', 'profile'],
      loggingLevel: 'info',
      loggingNoPII: false,
      useCookieInsteadOfSession: true,
      cookieEncryptionKeys: [
        {
          key: config.get('AUTH_AD_COOKIE_KEY'),
          iv: config.get('AUTH_AD_COOKIE_IV'),
        },
      ],
    });
  }

  async validate(_: any, profile: any) {
    // let { email } = profile._json || {}

    // if (!email) {
    let  email = profile._json.preferred_username;
    // }
   
    if (email) {
      const user = await this.usersService.findOneOrCreateMicrosoftUser(
        email.toLowerCase(),
      );

      if (user && !user.subUnitId) {
        throw new NotFoundException('User does not belong to any sub unit!');
      }

      return user;
    }
    throw new UnauthorizedException();
  }
}
