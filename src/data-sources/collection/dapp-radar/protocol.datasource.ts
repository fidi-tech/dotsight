import axios, { Axios, AxiosHeaders } from 'axios';
import { Protocol } from '../../../entities/protocol.entity';
import { Units } from '../../../entities/entity';
import { USD } from '../../../common/currecies';
import { AbstractProtocolDataSource } from '../../abstract.protocol.data-source';
import { Meta } from '../../abstract.data-source';

type Config = {
  key: string;
  endpoint: string;
};

type Params = {
  chain?: string;
};

type DappRadarApp = {
  dappId: number;
  name: string;
  logo: string | null;
  chains: string[];
  tvl: number;
  marketCap: number;
};

export class DappRadarProtocolDatasource extends AbstractProtocolDataSource<
  Config,
  Params
> {
  private httpClient: Axios;

  constructor(config: Config) {
    super(config);
    this.httpClient = axios.create({
      baseURL: this.config.endpoint,
      headers: new AxiosHeaders({
        'X-BLOBR-KEY': this.config.key,
      }),
    });
  }

  public async getItems({ chain }: Params): Promise<{
    items: Protocol[];
    meta: Meta;
  }> {
    const items: Protocol[] = [];
    const units: Units = {
      [USD.id]: USD,
    };
    let page = 1;
    let pageCount;

    do {
      const response = await this.getPaginatedProtocols(chain, page);
      page = response.data.page + 1;
      pageCount = response.data.pageCount;

      items.push(
        ...response.data.results.map(
          (dapp): Protocol => ({
            id: dapp.dappId.toString(),
            entity: 'protocol',
            meta: {
              name: dapp.name,
              logoUrl: dapp.logo,
            },
            metrics: {
              tvl: dapp.tvl ? { [USD.id]: dapp.tvl } : undefined,
              marketCap: dapp.marketCap
                ? { [USD.id]: dapp.marketCap }
                : undefined,
            },
            historicalMetrics: {
              tvl: dapp.tvl
                ? [
                    {
                      timestamp: Math.floor(Date.now() / 1000),
                      value: { [USD.id]: dapp.tvl },
                    },
                  ]
                : undefined,
              marketCap: dapp.marketCap
                ? [
                    {
                      timestamp: Math.floor(Date.now() / 1000),
                      value: { [USD.id]: dapp.marketCap },
                    },
                  ]
                : undefined,
            },
          }),
        ),
      );
    } while (page < pageCount);

    return {
      items,
      meta: {
        units,
      },
    };
  }

  private RESULTS_PER_PAGE = 50;
  private getPaginatedProtocols(chain: string, page: number) {
    return this.httpClient.get<{
      results: DappRadarApp[];
      page: number;
      pageCount: number;
    }>('/defi/dapps', {
      params: {
        page,
        resultsPerPage: this.RESULTS_PER_PAGE,
        chain,
      },
    });
  }
}