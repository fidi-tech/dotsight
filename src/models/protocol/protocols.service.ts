import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IProtocol, ProtocolId } from './interfaces/protocol.interface';
import { Observable, mergeMap, merge, from } from 'rxjs';
import { ProtocolSource } from './entities/protocolSource.entity';
import { Repository } from 'typeorm';
import { ProtocolPlugin } from '../../plugins/protocol.plugin';
import { protocols as protocolPlugins } from '../../plugins/protocols';
import { HttpService } from '@nestjs/axios';

class ProtocolPluginTypeCollisionError extends Error {}
class ProtocolPluginTypeNotRegisteredError extends Error {}

@Injectable()
export class ProtocolsService {
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

  private async getProtocolSources() {
    const sources = await this.protocolSourcesRepository.find();
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
