import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-web3';
import { AuthService } from '../services/auth/auth.service';
import { Injectable } from '@nestjs/common';

class AdapterStrategy extends Strategy {
  constructor(callback) {
    // there are extra garbage arguments that break the @nestjs/passport logic, so we ignore them
    super(function callbackWrap(address, done, ...garbage) {
      return callback(address, done);
    });
  }
}

@Injectable()
export class Web3Strategy extends PassportStrategy(AdapterStrategy, 'web3') {
  private static Issuer = 'web3';

  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(address: string) {
    const user = await this.authService.validateUser(
      Web3Strategy.Issuer,
      address,
    );
    if (!user) {
      return this.authService.createUser(Web3Strategy.Issuer, address);
    }
    return user;
  }
}
