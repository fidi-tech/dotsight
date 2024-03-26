import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './services/auth/auth.service';

@Controller('auth')
export class AuthControllerDev {
  constructor(private readonly authService: AuthService) {}

  private async callback(response: Response, issuer, subjectId) {
    let user = await this.authService.validateUser(issuer, subjectId);
    if (!user) {
      user = await this.authService.createUser(issuer, subjectId);
    }

    return await this.authService.signIn(response, user);
  }

  @Get('/google')
  async loginGoogle(@Res() response: Response) {
    return response.redirect('/api/auth/google/callback');
  }

  @Get('/google/callback')
  async callbackGoogle(@Req() request, @Res() response: Response) {
    return this.callback(response, 'dev-google', 'dotsight-developer-google');
  }

  @Get('/twitter')
  async loginTwitter(@Res() response: Response) {
    return response.redirect('/api/auth/twitter/callback');
  }

  @Get('/twitter/callback')
  async callbackTwitter(@Req() request, @Res() response: Response) {
    return this.callback(response, 'dev-twitter', 'dotsight-developer-twitter');
  }

  @Get('/github')
  async loginGithub(@Res() response: Response) {
    return response.redirect('/api/auth/github/callback');
  }

  @Get('/github/callback')
  async callbackGithub(@Req() request, @Res() response: Response) {
    return this.callback(response, 'dev-github', 'dotsight-developer-github');
  }

  @Get('/logout')
  async logout(@Res() response: Response) {
    return await this.authService.logout(response);
  }
}
