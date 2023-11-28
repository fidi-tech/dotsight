import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './services/auth/auth.service';
import { GoogleGuard } from './guards/google.guard';
import { TwitterGuard } from './guards/twitter.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(GoogleGuard)
  @Get('/google')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async loginGoogle() {}

  @UseGuards(GoogleGuard)
  @Get('/google/callback')
  async callbackGoogle(@Req() request, @Res() response: Response) {
    return await this.authService.signIn(response, request.user);
  }

  @UseGuards(TwitterGuard)
  @Get('/twitter')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async loginTwitter() {}

  @UseGuards(TwitterGuard)
  @Get('/twitter/callback')
  async callbackTwitter(@Req() request, @Res() response: Response) {
    return await this.authService.signIn(response, request.user);
  }
}
