import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { ActorsModule } from '../../models/actor/actors.module';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { MissingConfigKey } from '../errors/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  imports: [
    ActorsModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('AUTH_JWT_SECRET');
        if (!secret) {
          throw new MissingConfigKey('AUTH_JWT_SECRET');
        }
        const expiresIn = configService.get<string>('AUTH_JWT_EXPIRES_IN');
        if (!expiresIn) {
          throw new MissingConfigKey('AUTH_JWT_EXPIRES_IN');
        }

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
