import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Actor } from './entities/actor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ActorId } from './interfaces/actor.interface';

@Injectable()
export class ActorsService {
  constructor(
    @InjectRepository(Actor)
    private readonly actorsRepository: Repository<Actor>,
  ) {}

  async findByLogin(login: string) {
    return await this.actorsRepository.findOne({
      where: {
        login,
      },
    });
  }

  async create(login: string, hashedPassword: string): Promise<ActorId> {
    const insert = await this.actorsRepository.insert({
      login,
      password: hashedPassword,
    });
    return insert.raw.id;
  }
}
