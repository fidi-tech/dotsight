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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dtos/login.dto';
import { LoginResponseDto } from './dtos/login.response.dto';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'get jwt-token for further operations' })
  @ApiOkResponse({
    description: 'access_token to use in further interactions',
    type: LoginResponseDto,
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(
    @Request() req,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() loginForm: LoginDto,
  ): Promise<LoginResponseDto> {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'create account' })
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
