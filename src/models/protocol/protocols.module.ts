import { Module } from '@nestjs/common';
import { ProtocolsService } from './protocols.service';
import { ProtocolsController } from './protocols.controller';
import { ProtocolSourcesModule } from '../protocolSource/protocolSources.module';

@Module({
  controllers: [ProtocolsController],
  imports: [ProtocolSourcesModule],
  providers: [ProtocolsService],
  exports: [ProtocolsService],
})
export class ProtocolsModule {}
