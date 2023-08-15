import { ProtocolDatasource } from '../../models/datasource/protocol.datasource';
import { Protocol } from '../../common/protocol';
import axios, { Axios, AxiosHeaders } from 'axios';
import { Units } from '../../common/entity';
import { USD } from '../../common/currecies';
import { GetItemsResult } from '../../models/datasource/datasource';

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

export class DappRadarProtocolDatasource extends ProtocolDatasource<
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

  public async getItems({
    chain,
  }: Params): Promise<GetItemsResult<Protocol, null>> {
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
    } while (false && page < pageCount); // TODO only one page for now

    return {
      units,
      items,
      meta: null,
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
