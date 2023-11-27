import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthControllerDev } from './auth.controller.dev';
import { AuthService } from './services/auth/auth.service';
import { UsersModule } from '../users/users.module';
import { GoogleOidcStrategy } from './strategies/google-oidc.strategy';
import { JwtModule } from '@nestjs/jwt';

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
  providers: [AuthService, GoogleOidcStrategy],
})
export class AuthModule {}
