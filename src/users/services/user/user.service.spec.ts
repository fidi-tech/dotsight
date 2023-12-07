import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { TestDbModule } from '../../../common/spec/db';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Credential } from '../../entities/credential.entity';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDbModule, TypeOrmModule.forFeature([User, Credential])],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
