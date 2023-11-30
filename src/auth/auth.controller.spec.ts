import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth/auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TestDbModule } from '../common/spec/db';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDbModule, UsersModule, JwtModule],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              switch (key) {
                case 'JWT_SECRET':
                  return 'JWT_SECRET';
                case 'UI_HOST':
                  return 'UI_HOST';
                default:
                  throw Error();
              }
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('callbackGoogle', () => {
    it('should call authService.signIn', async () => {
      const request = { user: '42' };
      const response = 'rs' as any as Response;
      jest.spyOn(authService, 'signIn').mockResolvedValue();
      await controller.callbackGoogle(request, response);
      expect(authService.signIn).toHaveBeenCalledTimes(1);
      expect(authService.signIn).toHaveBeenCalledWith(response, '42');
    });
  });

  describe('callbackTwitter', () => {
    it('should call authService.signIn', async () => {
      const request = { user: '42' };
      const response = 'rs' as any as Response;
      jest.spyOn(authService, 'signIn').mockResolvedValue();
      await controller.callbackTwitter(request, response);
      expect(authService.signIn).toHaveBeenCalledTimes(1);
      expect(authService.signIn).toHaveBeenCalledWith(response, '42');
    });
  });

  describe('callbackGithub', () => {
    it('should call authService.signIn', async () => {
      const request = { user: '42' };
      const response = 'rs' as any as Response;
      jest.spyOn(authService, 'signIn').mockResolvedValue();
      await controller.callbackGithub(request, response);
      expect(authService.signIn).toHaveBeenCalledTimes(1);
      expect(authService.signIn).toHaveBeenCalledWith(response, '42');
    });
  });
});
