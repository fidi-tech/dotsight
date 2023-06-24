import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProtocolSource } from './entities/protocolSource.entity';
import { ProjectId } from '../project/interfaces/project.interface';
import { protocols as protocolPlugins } from '../../plugins/protocols';
import { HttpService } from '@nestjs/axios';
import { ProtocolPlugin } from '../../plugins/protocol.plugin';

class ProtocolPluginTypeCollisionError extends Error {}
class ProtocolPluginTypeNotRegisteredError extends Error {}

@Injectable()
export class ProtocolSourcesService {
  private typeToPlugin = new Map<
    string,
    new (
      id: string,
      config: any,
      httpService: HttpService,
    ) => ProtocolPlugin<any>
  >();

  constructor(
    @InjectRepository(ProtocolSource)
    private readonly protocolSourcesRepository: Repository<ProtocolSource>,
    private readonly httpService: HttpService,
  ) {
    for (const protocolPlugin of protocolPlugins) {
      const type = protocolPlugin.getType();
      if (this.typeToPlugin.get(type)) {
        throw new ProtocolPluginTypeCollisionError(
          `Cannot register protocol plugin "${
            protocolPlugin.constructor.name
          }", type "${type}" already registered for "${
            this.typeToPlugin.get(type).constructor.name
          }"`,
        );
      }
      this.typeToPlugin.set(type, protocolPlugin);
    }
  }

  async getProtocolSources(projectId: ProjectId) {
    const sources = await this.protocolSourcesRepository.find({
      where: {
        projectId,
      },
    });
    return sources.map(({ id, type, config }) => {
      const plugin = this.typeToPlugin.get(type);
      if (!plugin) {
        throw new ProtocolPluginTypeNotRegisteredError(
          `Protocol plugin type "${type}" is not registered`,
        );
      }
      return new plugin(id, config, this.httpService);
    });
  }
}
