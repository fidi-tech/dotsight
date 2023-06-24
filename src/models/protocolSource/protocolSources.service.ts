import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProtocolSource } from './entities/protocolSource.entity';
import { ProjectId } from '../project/interfaces/project.interface';
import { protocols as protocolPlugins } from '../../plugins/protocols';
import { HttpService } from '@nestjs/axios';
import { ProtocolPlugin } from '../../plugins/protocol.plugin';
import { ProjectsService } from '../project/projects.service';
import { IProtocolSource } from './interfaces/protocolSource.interface';

@Injectable()
export class ProtocolSourcesService {
  public static ProtocolPluginTypeCollisionError = class ProtocolPluginTypeCollisionError extends Error {
    constructor(msg: string) {
      super(msg);
    }
  };
  public static ProtocolPluginTypeNotRegisteredError = class ProtocolPluginTypeNotRegisteredError extends Error {
    constructor(type: string) {
      super(`Protocol plugin type "${type}" is not registered`);
    }
  };

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
    private readonly projectsService: ProjectsService,
  ) {
    for (const protocolPlugin of protocolPlugins) {
      const type = protocolPlugin.getType();
      if (this.typeToPlugin.get(type)) {
        throw new ProtocolSourcesService.ProtocolPluginTypeCollisionError(
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
        throw new ProtocolSourcesService.ProtocolPluginTypeNotRegisteredError(
          type,
        );
      }
      // @ts-expect-error typescript does not see that we have this static method
      plugin.validateConfig(config);
      return new plugin(id, config, this.httpService);
    });
  }

  async create(
    projectId: ProjectId,
    type: string,
    config: object,
  ): Promise<IProtocolSource> {
    const plugin = this.typeToPlugin.get(type);
    if (!plugin) {
      throw new ProtocolSourcesService.ProtocolPluginTypeNotRegisteredError(
        type,
      );
    }
    // @ts-expect-error typescript does not see that we have this static method
    plugin.validateConfig(config);

    const project = this.projectsService.findById(projectId);
    if (!project) {
      throw new ProjectsService.ProjectNotFoundError(projectId);
    }

    const insert = await this.protocolSourcesRepository.insert({
      type,
      config,
      projectId,
    });

    return this.protocolSourcesRepository.findOne({
      where: {
        id: insert.raw[0].id,
      },
    });
  }
}
