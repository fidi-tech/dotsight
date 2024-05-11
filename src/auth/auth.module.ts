import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthControllerDev } from './auth.controller.dev';
import { AuthService } from './services/auth/auth.service';
import { UsersModule } from '../users/users.module';
import { GoogleOidcStrategy } from './strategies/google-oidc.strategy';
import { JwtModule } from '@nestjs/jwt';
import { TwitterStrategy } from './strategies/twitter.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { Web3Strategy } from './strategies/web3.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
    }),
  ],
  controllers:
    process.env.NODE_ENV === 'development'
      ? [AuthControllerDev]
      : [AuthController],
  providers:
    process.env.NODE_ENV === 'development'
      ? [AuthService, Web3Strategy]
      : [
          AuthService,
          GoogleOidcStrategy,
          TwitterStrategy,
          GithubStrategy,
          Web3Strategy,
        ],
})
export class AuthModule {}
