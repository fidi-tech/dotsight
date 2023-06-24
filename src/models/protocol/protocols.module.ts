import { Module } from '@nestjs/common';
import { ProtocolsService } from './protocols.service';
import { ProtocolsController } from './protocols.controller';
import { ProtocolSourcesModule } from '../protocolSource/protocolSources.module';
import { ProjectsModule } from '../project/projects.module';

@Module({
  controllers: [ProtocolsController],
  imports: [ProtocolSourcesModule, ProjectsModule],
  providers: [ProtocolsService],
  exports: [ProtocolsService],
})
export class ProtocolsModule {}
