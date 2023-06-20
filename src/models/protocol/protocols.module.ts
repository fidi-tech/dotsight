import { Module } from '@nestjs/common';
import { ProtocolsService } from './protocols.service';
import { ProtocolsController } from './protocols.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtocolSource } from './entities/protocolSource.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [ProtocolsController],
  imports: [TypeOrmModule.forFeature([ProtocolSource]), HttpModule],
  providers: [ProtocolsService],
  exports: [ProtocolsService],
})
export class ProtocolsModule {}
