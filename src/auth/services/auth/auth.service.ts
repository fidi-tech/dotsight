import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../../users/services/user/user.service';
import { User } from '../../../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private jwtSecret: string;
  private uiHost: string;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    this.uiHost = this.configService.getOrThrow<string>('UI_HOST');
  }

  async createUser(issuer: string, subjectId: string) {
    return this.userService.create(issuer, subjectId);
  }

  async validateUser(issuer: string, subjectId: string): Promise<User | null> {
    return this.userService.queryByIssuerAndSubjectId(issuer, subjectId);
  }

  async signIn(response: Response, user: User) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }

    const token = this.jwtService.sign(
      {
        sub: user.id,
      },
      {
        secret: this.jwtSecret,
      },
    );

    response.cookie('access_token', token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: true,
      secure: false,
    });

    return response.redirect(this.uiHost);
  }

  async logout(response: Response) {
    response.clearCookie('access_token');
    return response.redirect(this.uiHost);
  }
}
