import {
  Get,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
  Query,
} from '@nestjs/common';
import { ProtocolEntity } from './serializers/protocol.serializer';
import { ProtocolsService } from './protocols.service';
import { firstValueFrom, toArray } from 'rxjs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProtocolsQueryDto } from './dtos/protocols.query.dto';
import { ProtocolQueryDto } from './dtos/protocol.query.dto';

@Controller('protocols')
@ApiTags('protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'get protocol metadata' })
  async get(
    @Param('id') id: string,
    @Query() protocolsQuery: ProtocolQueryDto,
  ): Promise<ProtocolEntity> {
    return this.protocolsService.getProtocolById(protocolsQuery.projectId, id);
  }

  @Get('/')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'get all available protocols' })
  async getAll(
    @Query() protocolsQuery: ProtocolsQueryDto,
  ): Promise<ProtocolEntity[]> {
    return firstValueFrom(
      this.protocolsService
        .getProtocols(protocolsQuery.projectId)
        .pipe(toArray()),
    );
  }
}
