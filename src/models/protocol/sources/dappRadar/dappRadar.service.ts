import { AxiosHeaders } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EMPTY, expand, filter, mergeMap, Observable } from 'rxjs';
import { IProtocol, ProtocolId } from '../../interfaces/protocol.interface';
import { Protocol } from '../../entities/protocol.entity';

@Injectable()
export class DappRadarService {
  private readonly logger = new Logger(DappRadarService.name);
  private RESULTS_PER_PAGE = 50;

  constructor(private readonly httpService: HttpService) {}

  // TODO hide secrets
  private getHeaders() {
    return new AxiosHeaders({
      'X-BLOBR-KEY': '',
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
    }>('https://api.dappradar.com/4tsxo4vuhotaojtl/dapps', {
      headers: this.getHeaders(),
      params: {
        page,
        resultsPerPage: this.RESULTS_PER_PAGE,
        chain: 'astar',
      },
    });
  }

  getProtocols(): Observable<IProtocol> {
    return this.getPaginatedProtocols(0).pipe(
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
