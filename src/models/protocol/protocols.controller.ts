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
import { ProtocolsService } from './protocols.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProtocolsQueryDto } from './dtos/protocols.query.dto';
import { ProtocolQueryDto } from './dtos/protocol.query.dto';
import { JwtAuthGuard } from '../../common/auth/guards/jwt.guard';
import { ProtocolMetricsQueryDto } from './dtos/protocolMetrics.query.dto';
import { TimeSeries } from '../../common/metrics';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ProtocolResponseDto } from './dtos/protocol.response.dto';
import { ProtocolsResponseDto } from './dtos/protocols.response.dto';

@Controller('protocols')
@ApiTags('protocols')
export class ProtocolsController {
  constructor(private readonly protocolsService: ProtocolsService) {}

  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "get protocol's metadata" })
  @ApiOkResponse({
    description: "protocol's metadata",
    type: ProtocolResponseDto,
  })
  async get(
    @Request() req,
    @Param('id') id: string,
    @Query() protocolsQuery: ProtocolQueryDto,
  ): Promise<ProtocolResponseDto> {
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
  @ApiOkResponse({
    description: "all protocols' metadata",
    type: ProtocolsResponseDto,
  })
  async getAll(
    @Request() req,
    @Query() protocolsQuery: ProtocolsQueryDto,
  ): Promise<ProtocolsResponseDto> {
    const protocols = await this.protocolsService.getProtocols(
      req.user.id,
      protocolsQuery.projectId,
    );
    return new ProtocolsResponseDto(protocols);
  }

  @Get('/:id/metric')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "get protocol's metrics" })
  @ApiOkResponse({
    description: "metric's data",
    type: TimeSeries,
  })
  async getMetrics(
    @Request() req,
    @Param('id') id: string,
    @Query() protocolMetricsQuery: ProtocolMetricsQueryDto,
  ): Promise<TimeSeries> {
    return this.protocolsService.getProtocolMetric(
      req.user.id,
      protocolMetricsQuery.projectId,
      id,
      protocolMetricsQuery.metric,
      protocolMetricsQuery.dateFrom,
      protocolMetricsQuery.dateTo,
    );
  }
}
