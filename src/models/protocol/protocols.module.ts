import { Module } from '@nestjs/common';
import { ProtocolsService } from './protocols.service';
import { ProtocolsController } from './protocols.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcesModule } from './sources/sources.module';
import { ProtocolSource } from './entities/protocolSource.entity';

@Module({
  controllers: [ProtocolsController],
  imports: [TypeOrmModule.forFeature([ProtocolSource]), SourcesModule],
  providers: [ProtocolsService],
  exports: [ProtocolsService],
})
export class ProtocolsModule {}
