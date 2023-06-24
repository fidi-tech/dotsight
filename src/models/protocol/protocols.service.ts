import { Injectable } from '@nestjs/common';
import { IProtocol, ProtocolId } from './interfaces/protocol.interface';
import { ProjectId } from '../project/interfaces/project.interface';
import { ProtocolSourcesService } from '../protocolSource/protocolSources.service';
import { ActorId } from '../actor/interfaces/actor.interface';
import { ProjectsService } from '../project/projects.service';

@Injectable()
export class ProtocolsService {
  public static ProtocolsAccessDeniedError = class ProtocolsAccessDeniedError extends Error {
    constructor() {
      super(`Access denied`);
    }
  };

  constructor(
    private readonly protocolSourcesService: ProtocolSourcesService,
    private readonly projectsService: ProjectsService,
  ) {}

  public async getProtocolById(
    actorId: ActorId,
    projectId: ProjectId,
    id: ProtocolId,
  ): Promise<IProtocol | null> {
    const project = await this.projectsService.findById(projectId);
    if (project.createdBy !== actorId) {
      throw new ProtocolsService.ProtocolsAccessDeniedError();
    }
    const sources = await this.protocolSourcesService.getProtocolSources(
      projectId,
    );
    const result: Promise<IProtocol | null> = new Promise((resolve) => {
      if (sources.length === 0) {
        return resolve(null);
      }

      const pendingSources = new Set(sources);
      for (const source of sources) {
        source
          .getProtocolById(id)
          .then((protocol) => {
            if (protocol) {
              return resolve(protocol);
            } else {
              pendingSources.delete(source);
              if (pendingSources.size === 0) {
                return resolve(null);
              }
            }
          })
          .catch(() => {
            pendingSources.delete(source);
            if (pendingSources.size === 0) {
              return resolve(null);
            }
          });
      }
    });
    return result;
  }

  public async getProtocols(
    actorId: ActorId,
    projectId: ProjectId,
  ): Promise<IProtocol[]> {
    const project = await this.projectsService.findById(projectId);
    if (project.createdBy !== actorId) {
      throw new ProtocolsService.ProtocolsAccessDeniedError();
    }

    const sources = await this.protocolSourcesService.getProtocolSources(
      projectId,
    );
    return (
      await Promise.all(sources.map((source) => source.getProtocols()))
    ).reduce((acc, protocols) => acc.concat(protocols), []);
  }
}
