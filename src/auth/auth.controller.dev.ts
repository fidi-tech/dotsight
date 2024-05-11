import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './services/auth/auth.service';
import { Web3Guard } from './guards/web3.guard';
import { Web3LoginDto } from './dto/web3-login.dto';

@Controller('auth')
export class AuthControllerDev {
  constructor(private readonly authService: AuthService) {}

  private async callback(response: Response, issuer, subjectId) {
    let user = await this.authService.validateUser(issuer, subjectId);
    if (!user) {
      user = await this.authService.createUser(issuer, subjectId);
    }

    return await this.authService.signIn(response, user!);
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

  @UseGuards(Web3Guard)
  @Get('/web3')
  async loginWeb3(
    @Req() request,
    @Res() response: Response,
    // we do not need the query params, adding them here only to describe the method for the openapi
    @Query() _: Web3LoginDto,
  ) {
    return await this.authService.signIn(response, request.user);
  }

  @Get('/logout')
  async logout(@Res() response: Response) {
    return await this.authService.logout(response);
  }
}
