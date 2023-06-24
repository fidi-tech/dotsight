import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProtocolSourceDto } from './dtos/createProtocolSource.dto';
import { ProtocolSourcesService } from './protocolSources.service';
import { ProjectsService } from '../project/projects.service';
import { PluginBadConfigError } from '../../plugins/protocol.plugin';

@Controller('protocol-sources')
@ApiTags('protocol-sources')
export class ProtocolSourcesController {
  constructor(
    private readonly protocolSourcesService: ProtocolSourcesService,
  ) {}

  @Post('/')
  @ApiOperation({ summary: 'create protocols source instance' })
  async create(@Body() { projectId, type, config }: CreateProtocolSourceDto) {
    try {
      return await this.protocolSourcesService.create(projectId, type, config);
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
