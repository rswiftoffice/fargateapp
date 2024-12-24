import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtQueryParamStrategy, JwtStrategy } from './strategies/jwt.strategy';
import { AzureADStrategy } from './strategies/azure-ad.strategy';
import { AzureADStrategyWeb } from './strategies/azure-ad-web.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    AzureADStrategy,
    AzureADStrategyWeb,
    JwtQueryParamStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
