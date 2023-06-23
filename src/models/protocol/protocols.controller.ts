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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('protocols')
@ApiTags('protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'get protocol metadata' })
  async get(@Param('id') id: string): Promise<ProtocolEntity> {
    return this.protocolsService.getProtocolById(id);
  }

  @Get('/')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'get all available protocols' })
  async getAll(): Promise<ProtocolEntity[]> {
    return firstValueFrom(this.protocolsService.getProtocols().pipe(toArray()));
  }
}
