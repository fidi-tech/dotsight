import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './services/auth/auth.service';

@Controller('auth')
export class AuthControllerDev {
  constructor(private readonly authService: AuthService) {}

  @Get('/google')
  async loginGoogle(@Res() response: Response) {
    return response.redirect('/api/auth/google/callback');
  }

  @Get('/google/callback')
  async callbackGoogle(@Req() request, @Res() response: Response) {
    const user = await this.authService.createUser(
      'dev-google',
      `dotsight-developer-${Math.random()}`,
    );
    return await this.authService.signIn(response, user);
  }

  @Get('/twitter')
  async loginTwitter(@Res() response: Response) {
    return response.redirect('/api/auth/twitter/callback');
  }

  @Get('/twitter/callback')
  async callbackTwitter(@Req() request, @Res() response: Response) {
    const user = await this.authService.createUser(
      'dev-twitter',
      `dotsight-developer-${Math.random()}`,
    );
    return await this.authService.signIn(response, user);
  }

  @Get('/github')
  async loginGithub(@Res() response: Response) {
    return response.redirect('/api/auth/github/callback');
  }

  @Get('/github/callback')
  async callbackGithub(@Req() request, @Res() response: Response) {
    const user = await this.authService.createUser(
      'dev-github',
      `dotsight-developer-${Math.random()}`,
    );
    return await this.authService.signIn(response, user);
  }

  @Get('/logout')
  async logout(@Res() response: Response) {
    return await this.authService.logout(response);
  }
}
