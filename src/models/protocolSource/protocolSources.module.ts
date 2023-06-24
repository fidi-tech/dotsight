import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ProtocolSource } from './entities/protocolSource.entity';
import { ProtocolSourcesService } from './protocolSources.service';
import { ProtocolSourcesController } from './protocolSources.controller';
import { ProjectsModule } from '../project/projects.module';

@Module({
  controllers: [ProtocolSourcesController],
  imports: [
    TypeOrmModule.forFeature([ProtocolSource]),
    HttpModule,
    ProjectsModule,
  ],
  providers: [ProtocolSourcesService],
  exports: [ProtocolSourcesService],
})
export class ProtocolSourcesModule {}
