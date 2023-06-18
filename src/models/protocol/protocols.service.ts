import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SourcesService } from './sources/sources.service';
import { IProtocol, ProtocolId } from './interfaces/protocol.interface';
import { Observable, mergeMap, merge, from } from 'rxjs';
import { ProtocolSource } from './entities/protocolSource.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProtocolsService {
  constructor(
    @InjectRepository(ProtocolSource)
    private readonly protocolSourcesRepository: Repository<ProtocolSource>,
    @Inject(SourcesService)
    private readonly sourcesService: SourcesService,
  ) {}

  private async getProtocolSources() {
    const sources = await this.protocolSourcesRepository.find();
    return sources.map((source) =>
      this.sourcesService.getSourceByType(source.type),
    );
  }

  public async getProtocolById(id: ProtocolId): Promise<IProtocol | null> {
    const sources = await this.getProtocolSources();
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

  public getProtocols(): Observable<IProtocol> {
    return from(this.getProtocolSources()).pipe(
      mergeMap((sources) =>
        merge(...sources.map((source) => source.getProtocols())),
      ),
    );
  }
}
