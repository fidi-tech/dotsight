import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy } from 'passport-google-oidc';
import { AuthService } from '../services/auth/auth.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleOidcStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${configService.getOrThrow<string>(
        'HOST',
      )}/auth/google/callback`,
    });
  }

  async validate(issuer: string, profile: Profile) {
    const user = await this.authService.validateUser(issuer, profile.id);
    if (!user) {
      return this.authService.createUser(issuer, profile.id);
    }
    return user;
  }
}
