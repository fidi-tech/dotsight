import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { IActor } from '../../../models/actor/interfaces/actor.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'login',
    });
  }

  async validate(login: string, password: string): Promise<IActor | null> {
    const actor = await this.authService.validateActor(login, password);
    if (!actor) {
      throw new UnauthorizedException();
    }
    return actor;
  }
}
