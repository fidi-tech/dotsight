import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ProtocolSource } from './entities/protocolSource.entity';
import { ProtocolSourcesService } from './protocolSources.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProtocolSource]), HttpModule],
  providers: [ProtocolSourcesService],
  exports: [ProtocolSourcesService],
})
export class ProtocolSourcesModule {}
