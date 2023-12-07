import { Module } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Credential } from './entities/credential.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Credential])],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
