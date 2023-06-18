import {
  Get,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
} from '@nestjs/common';
import { ProtocolEntity } from './serializers/protocol.serializer';
import { ProtocolsService } from './protocols.service';
import { firstValueFrom, toArray } from 'rxjs';

@Controller('protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async get(@Param('id') id: string): Promise<ProtocolEntity> {
    return this.protocolsService.getProtocolById(id);
  }

  @Get('/')
  @UseInterceptors(ClassSerializerInterceptor)
  async getAll(): Promise<ProtocolEntity[]> {
    return firstValueFrom(this.protocolsService.getProtocols().pipe(toArray()));
  }
}
