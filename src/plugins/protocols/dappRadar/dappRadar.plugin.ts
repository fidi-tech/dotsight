import { ProtocolPlugin, PluginBadConfigError } from '../../protocol.plugin';
import { Injectable } from '@nestjs/common';
import { AxiosHeaders } from 'axios';
import { EMPTY, expand, filter, mergeMap, Observable } from 'rxjs';
import {
  IProtocol,
  ProtocolId,
} from '../../../models/protocol/interfaces/protocol.interface';
import { Protocol } from '../../../models/protocol/entities/protocol.entity';
import { HttpService } from '@nestjs/axios';

type Config = {
  id: string;
  key: string;
  endpoint: string;
  chain: string;
};

@Injectable()
export class DappRadarPlugin extends ProtocolPlugin<Config> {
  static getType() {
    return 'protocol-plugin-dapp';
  }

  private RESULTS_PER_PAGE = 50;

  constructor(id: string, config: Config, httpService: HttpService) {
    super(id, config, httpService);
    if (!config.chain || typeof config.chain !== 'string') {
      throw new PluginBadConfigError('Chain was not specified');
    }
    if (!config.endpoint || typeof config.endpoint !== 'string') {
      throw new PluginBadConfigError('Endpoint was not specified');
    }
    if (!config.key || typeof config.key !== 'string') {
      throw new PluginBadConfigError('Key was not specified');
    }
  }

  private getHeaders() {
    return new AxiosHeaders({
      'X-BLOBR-KEY': this.config.key,
    });
  }

  private getPaginatedProtocols(page: number) {
    return this.httpService.get<{
      results: Array<{
        dappId: number;
        name: string;
        description: string | null;
        fullDescription: string | null;
        logo: string | null;
        link: string;
        website: string;
        categories: string[];
        socialLinks: Array<{
          title: string;
          url: string;
          type: string;
        }>;
        chains: string[];
      }>;
      page: number;
      pageCount: number;
    }>(`${this.config.endpoint}/dapps`, {
      headers: this.getHeaders(),
      params: {
        page,
        resultsPerPage: this.RESULTS_PER_PAGE,
        chain: this.config.chain,
      },
    });
  }

  getProtocols(): Observable<IProtocol> {
    return this.getPaginatedProtocols(1).pipe(
      expand((response) => {
        const { page, pageCount } = response.data;
        if (page >= pageCount) {
          return EMPTY;
        }
        return this.getPaginatedProtocols(page + 1);
      }),
      mergeMap((response) => {
        return response.data.results.map(
          ({ dappId, name, description, logo, link }) =>
            new Protocol(`${dappId}`, name, description, logo, link),
        );
      }),
    );
  }

  async getProtocolById(id: ProtocolId): Promise<IProtocol | null> {
    const result: Promise<IProtocol | null> = new Promise((resolve) => {
      this.getProtocols()
        .pipe(filter((protocol) => protocol.id === id))
        .subscribe(
          resolve,
          () => resolve(null),
          () => resolve(null),
        );
    });
    return result;
  }
}
