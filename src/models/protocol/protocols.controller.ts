import {
  Get,
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProtocolEntity } from './serializers/protocol.serializer';
import { ProtocolsService } from './protocols.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProtocolsQueryDto } from './dtos/protocols.query.dto';
import { ProtocolQueryDto } from './dtos/protocol.query.dto';
import { JwtAuthGuard } from '../../common/auth/guards/jwt.guard';

@Controller('protocols')
@ApiTags('protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get protocol metadata' })
  async get(
    @Request() req,
    @Param('id') id: string,
    @Query() protocolsQuery: ProtocolQueryDto,
  ): Promise<ProtocolEntity> {
    return this.protocolsService.getProtocolById(
      req.user.id,
      protocolsQuery.projectId,
      id,
    );
  }

  @Get('/')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all available protocols' })
  async getAll(
    @Request() req,
    @Query() protocolsQuery: ProtocolsQueryDto,
  ): Promise<ProtocolEntity[]> {
    return this.protocolsService.getProtocols(
      req.user.id,
      protocolsQuery.projectId,
    );
  }
}
