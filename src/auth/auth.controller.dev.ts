import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './services/auth/auth.service';

@Controller('auth')
export class AuthControllerDev {
  constructor(private readonly authService: AuthService) {}

  @Get('/google')
  async loginGoogle(@Res() response: Response) {
    return response.redirect('/auth/google/callback');
  }

  @Get('/google/callback')
  async callbackGoogle(@Req() request, @Res() response: Response) {
    const user = await this.authService.createUser(
      'dev-google',
      `dotsight-developer-${Math.random()}`,
    );
    return await this.authService.signIn(response, user);
  }
}
