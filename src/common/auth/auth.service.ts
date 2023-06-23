import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ActorsService } from '../../models/actor/actors.service';
import { IActor } from '../../models/actor/interfaces/actor.interface';

export class LoginCollisionError extends Error {
  constructor(login: string) {
    super(`Login "${login}" is already taken`);
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly actorsService: ActorsService,
    private jwtService: JwtService,
  ) {}

  async validateActor(
    username: string,
    password: string,
  ): Promise<IActor | null> {
    const actor = await this.actorsService.findByLogin(username);
    const isPasswordValid =
      actor && (await bcrypt.compare(password, actor.password));
    if (isPasswordValid) {
      return actor;
    }
    return null;
  }

  async login(actor: IActor) {
    const payload = { login: actor.login, sub: actor.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(login: string, password: string) {
    const collision = await this.actorsService.findByLogin(login);
    if (collision) {
      throw new LoginCollisionError(login);
    }

    await this.actorsService.create(login, await bcrypt.hash(password, 10));
  }
}
