import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProtocolSourceDto } from './dtos/createProtocolSource.dto';
import { ProtocolSourcesService } from './protocolSources.service';
import { ProjectsService } from '../project/projects.service';
import { PluginBadConfigError } from '../../plugins/protocol.plugin';
import { JwtAuthGuard } from '../../common/auth/guards/jwt.guard';
import { ProtocolSourceResponseDto } from './dtos/protocolSource.response.dto';

@Controller('protocol-sources')
@ApiTags('protocol-sources')
export class ProtocolSourcesController {
  constructor(
    private readonly protocolSourcesService: ProtocolSourcesService,
  ) {}

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'create protocols source instance' })
  @ApiCreatedResponse({
    description: "protocol's metadata",
    type: ProtocolSourceResponseDto,
  })
  async create(
    @Request() req,
    @Body() { projectId, type, config }: CreateProtocolSourceDto,
  ): Promise<ProtocolSourceResponseDto> {
    try {
      return await this.protocolSourcesService.create(
        req.user.id,
        projectId,
        type,
        config,
      );
    } catch (err) {
      if (
        err instanceof
          ProtocolSourcesService.ProtocolPluginTypeNotRegisteredError ||
        err instanceof ProjectsService.ProjectNotFoundError ||
        err instanceof PluginBadConfigError
      ) {
        throw new BadRequestException(err.message, { cause: err });
      }
      throw err;
    }
  }
}
