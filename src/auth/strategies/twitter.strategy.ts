import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy } from 'passport-google-oidc';
import { AuthService } from '../services/auth/auth.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  private static Issuer = 'https://twitter.com';

  constructor(
    private readonly authService: AuthService,
    readonly configService: ConfigService,
  ) {
    super({
      consumerKey: configService.getOrThrow<string>('TWITTER_API_KEY'),
      consumerSecret: configService.getOrThrow<string>('TWITTER_API_SECRET'),
      callbackURL: `${configService.getOrThrow<string>(
        'HOST',
      )}/auth/twitter/callback`,
    });
  }

  async validate(token: string, tokenSecret: string, profile: Profile) {
    const user = await this.authService.validateUser(
      TwitterStrategy.Issuer,
      profile.id,
    );
    if (!user) {
      return this.authService.createUser(TwitterStrategy.Issuer, profile.id);
    }
    return user;
  }
}
