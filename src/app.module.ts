import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ProtocolsModule } from './models/protocol/protocols.module';
// import { ProtocolSource } from './models/protocolSource/entities/protocolSource.entity';
// import { AuthModule } from './common/auth/auth.module';
// import { Actor } from './models/actor/entities/actor.entity';
// import { ProjectsModule } from './models/project/projects.module';
// import { Project } from './models/project/entities/project.entity';
// import { MissingConfigKey } from './common/errors/config';
import { TestController } from './test.controller';

@Module({
  imports: [
    // TypeOrmModule.forRootAsync({
    //   useFactory: async (configService: ConfigService) => {
    //     const host = configService.get<string>('DB_HOST');
    //     if (!host) {
    //       throw new MissingConfigKey('DB_HOST');
    //     }
    //     const port = configService.get<number>('DB_PORT');
    //     if (!port) {
    //       throw new MissingConfigKey('DB_PORT');
    //     }
    //     const username = configService.get<string>('DB_USERNAME');
    //     if (!username) {
    //       throw new MissingConfigKey('DB_USERNAME');
    //     }
    //     const password = configService.get<string>('DB_PASSWORD');
    //     if (!password) {
    //       throw new MissingConfigKey('DB_PASSWORD');
    //     }
    //     const database = configService.get<string>('DB_DATABASE');
    //     if (!password) {
    //       throw new MissingConfigKey('DB_DATABASE');
    //     }
    //     return {
    //       type: 'postgres',
    //       host,
    //       port,
    //       username,
    //       password,
    //       database,
    //       entities: [ProtocolSource, Actor, Project],
    //       synchronize: true,
    //     };
    //   },
    //   inject: [ConfigService],
    // }),
    // ConfigModule.forRoot({
    //   isGlobal: true,
    // }),
    // ProtocolsModule,
    // ProjectsModule,
    // AuthModule,
  ],
  controllers: [TestController],
})
export class AppModule {}
