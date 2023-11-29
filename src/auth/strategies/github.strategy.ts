import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy } from 'passport-github2';
import { AuthService } from '../services/auth/auth.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private static Issuer = 'https://github.com';

  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: `${configService.getOrThrow<string>(
        'HOST',
      )}/api/auth/github/callback`,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = await this.authService.validateUser(
      GithubStrategy.Issuer,
      profile.id,
    );
    if (!user) {
      return this.authService.createUser(GithubStrategy.Issuer, profile.id);
    }
    return user;
  }
}
