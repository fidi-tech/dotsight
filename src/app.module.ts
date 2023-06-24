import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtocolsModule } from './models/protocol/protocols.module';
import { ProtocolSource } from './models/protocolSource/entities/protocolSource.entity';
import { AuthModule } from './common/auth/auth.module';
import { Actor } from './models/actor/entities/actor.entity';
import { ProjectsModule } from './models/project/projects.module';
import { Project } from './models/project/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'fidi',
      password: 's@m3pwd',
      database: 'fidi',
      entities: [ProtocolSource, Actor, Project],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ProtocolsModule,
    ProjectsModule,
    AuthModule,
  ],
})
export class AppModule {}
