import { Injectable } from '@nestjs/common';
import { IProtocol, ProtocolId } from './interfaces/protocol.interface';
import { Observable, mergeMap, merge, from } from 'rxjs';
import { ProjectId } from '../project/interfaces/project.interface';
import { ProtocolSourcesService } from '../protocolSource/protocolSources.service';

@Injectable()
export class ProtocolsService {
  constructor(
    private readonly protocolSourcesService: ProtocolSourcesService,
  ) {}

  public async getProtocolById(
    projectId: ProjectId,
    id: ProtocolId,
  ): Promise<IProtocol | null> {
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

  public getProtocols(projectId: ProjectId): Observable<IProtocol> {
    return from(this.protocolSourcesService.getProtocolSources(projectId)).pipe(
      mergeMap((sources) =>
        merge(...sources.map((source) => source.getProtocols())),
      ),
    );
  }
}
