import { Injectable } from '@nestjs/common';
import { IProtocol, ProtocolId } from './interfaces/protocol.interface';
import { ProjectId } from '../project/interfaces/project.interface';
import { ProtocolSourcesService } from '../protocolSource/protocolSources.service';
import { ActorId } from '../actor/interfaces/actor.interface';
import { ProjectsService } from '../project/projects.service';
import { ProtocolMetric } from '../../common/metrics/protocol.metrics';
import { firstValueFrom, toArray } from 'rxjs';
import { ProtocolSourceId } from '../protocolSource/interfaces/protocolSource.interface';

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

  private async isOwner(
    actorId: ActorId,
    projectId: ProjectId,
  ): Promise<boolean> {
    const project = await this.projectsService.findById(projectId);
    return project.createdBy === actorId;
  }

  private mixInSource(id: ProtocolId, sourceId: ProtocolSourceId) {
    return `${sourceId}@@${id}`;
  }

  private extractMixins(id: ProtocolId) {
    const [sourceId, protocolId] = id.split('@@');
    return {
      sourceId,
      protocolId,
    };
  }

  public async getProtocolById(
    actorId: ActorId,
    projectId: ProjectId,
    id: ProtocolId,
  ): Promise<IProtocol | null> {
    if (!(await this.isOwner(actorId, projectId))) {
      throw new ProtocolsService.ProtocolsAccessDeniedError();
    }
    const { protocolId, sourceId } = this.extractMixins(id);
    const source = await this.protocolSourcesService.getProtocolSource(
      projectId,
      sourceId,
    );

    const protocol = await source.getProtocolById(protocolId);
    return {
      ...protocol,
      id: this.mixInSource(protocol.id, source.getId()),
    };
  }

  public async getProtocols(
    actorId: ActorId,
    projectId: ProjectId,
  ): Promise<IProtocol[]> {
    if (!(await this.isOwner(actorId, projectId))) {
      throw new ProtocolsService.ProtocolsAccessDeniedError();
    }

    const sources = await this.protocolSourcesService.getProtocolSources(
      projectId,
    );
    return (
      await Promise.all(
        sources.map(async (source) => {
          const protocols = await firstValueFrom(
            source.getProtocols().pipe(toArray()),
          );

          return protocols.map((protocol) => ({
            ...protocol,
            id: this.mixInSource(protocol.id, source.getId()),
          }));
        }),
      )
    ).reduce((acc, protocols) => acc.concat(protocols), []);
  }

  public async getProtocolMetric(
    actorId: ActorId,
    projectId: ProjectId,
    id: ProtocolId,
    metric: ProtocolMetric,
    dateFrom: string,
    dateTo: string,
  ) {
    if (!(await this.isOwner(actorId, projectId))) {
      throw new ProtocolsService.ProtocolsAccessDeniedError();
    }

    const { protocolId, sourceId } = this.extractMixins(id);
    const source = await this.protocolSourcesService.getProtocolSource(
      projectId,
      sourceId,
    );

    return source.getProtocolMetric(protocolId, metric, dateFrom, dateTo);
  }
}
