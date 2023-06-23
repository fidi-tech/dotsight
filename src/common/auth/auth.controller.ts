import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { LocalGuard } from './guards/local.guard';
import { CreateUserDto } from './dtos/createUser.dto';
import { AuthService, LoginCollisionError } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      await this.authService.register(
        createUserDto.login,
        createUserDto.password,
      );
    } catch (err) {
      if (err instanceof LoginCollisionError) {
        throw new BadRequestException(err.message, { cause: err });
      }
      throw err;
    }
  }
}
