import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserId } from '../../entities/user.entity';
import { Credential } from '../../entities/credential.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource as TypeOrmDataSource } from 'typeorm/data-source/DataSource';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    private readonly dataSource: TypeOrmDataSource,
  ) {}

  async findById(id: UserId): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async queryByIssuerAndSubjectId(
    issuer: string,
    subjectId: string,
  ): Promise<User | null> {
    const credential = await this.credentialRepository.findOne({
      where: { issuer, subjectId },
      relations: {
        user: true,
      },
    });
    return credential?.user;
  }

  async create(issuer: string, subjectId: string) {
    let createdUser;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = queryRunner.connection.getRepository<User>(User).create();
      createdUser = await queryRunner.connection
        .getRepository<User>(User)
        .save(user);

      const credential = queryRunner.connection
        .getRepository<Credential>(Credential)
        .create({
          issuer,
          subjectId,
          user: createdUser,
        });
      await queryRunner.connection
        .getRepository<Credential>(Credential)
        .save(credential);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return createdUser;
  }
}
