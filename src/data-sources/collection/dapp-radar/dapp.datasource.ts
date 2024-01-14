import { BadRequestException } from '@nestjs/common';
import axios, { AxiosHeaders, AxiosInstance } from 'axios';

import { DApp, METRICS } from '../../../entities/dapp.entity';
import { Units } from '../../../entities/entity';
import { USD } from '../../../common/currecies';
import { Meta } from '../../abstract.data-source';
import { addLogging } from '../../../common/http';
import { URL_REGEXP } from '../../../common/regexp';
import { AbstractDappDataSource } from '../../abstract.dapp.data-source';

type Config = {
  key: string;
  endpoint: string;
};

const RANGES = ['24h', '7d', '30d'];
type Range = (typeof RANGES)[number];

type Params = {
  dappId: number;
  range: Range;
};

type DappRadarApp = {
  dappId: number;
  name: string;
  logo: string | null;
  chains: string[];
  metrics: Record<string, number>;
};

const scalarMetrics = ['transactions', 'uaw'];

export class DappRadarDappDatasource extends AbstractDappDataSource<
  Config,
  Params
> {
  private httpClient: AxiosInstance;

  public static getName(): string {
    return `DappRadar Dapps`;
  }

  public static getDescription(): string {
    return `Data source powered by DappRadar API that returns Dapps' data. Consult https://api-docs.dappradar.com for more info.`;
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'DappRadarDappDatasource configuration',
      type: 'object',
      properties: {
        key: {
          description: 'API key for the DappRadar API',
          type: 'string',
          minLength: 1,
        },
        endpoint: {
          description: 'API endpoint for the DappRadar API',
          type: 'string',
          pattern: URL_REGEXP,
        },
      },
      required: ['key', 'endpoint'],
    };
  }

  constructor(config: Config) {
    super(config);

    this.httpClient = axios.create({
      baseURL: this.config.endpoint,
      headers: new AxiosHeaders({
        'X-BLOBR-KEY': this.config.key,
      }),
    });

    addLogging('DappRadarDappDatasource', this.httpClient);
  }

  public async getItems({ dappId, range }: Params): Promise<{
    items: DApp[];
    meta: Meta;
  }> {
    if (!RANGES.includes(range)) {
      throw new BadRequestException(
        `Wrong range param. ${RANGES.join('|')} are available`,
      );
    }
    const items: DApp[] = [];
    const units: Units = {
      [USD.id]: USD,
    };

    const response = await this.fetchDApp({ dappId, range });
    const dApp = response.data.results;
    items.push({
      id: dApp.dappId.toString(),
      entity: 'dapp',
      meta: {
        name: dApp.name,
        logoUrl: dApp.logo,
      },
      metrics: METRICS.reduce((acc, metric) => {
        if (dApp.metrics[metric] !== null) {
          const changeKey = `${metric}PercentageChange`;
          const value = scalarMetrics.includes(metric)
            ? dApp.metrics[metric]
            : { [USD.id]: dApp.metrics[metric] };
          acc[metric] = {
            value,
            percentageChange: dApp.metrics[changeKey],
          };
        }
        return acc;
      }, {}),
      historicalMetrics: METRICS.reduce((acc, metric) => {
        if (dApp.metrics[metric] !== null) {
          const value = scalarMetrics.includes(metric)
            ? dApp.metrics[metric]
            : { [USD.id]: dApp.metrics[metric] };
          acc[metric] = [
            {
              timestamp: Math.floor(Date.now() / 1000),
              value,
            },
          ];
        }
        return acc;
      }, {}),
    });

    return {
      items,
      meta: {
        units,
      },
    };
  }

  public static getParamsSchema(): object {
    return {
      title: 'Params',
      description: 'DappRadarDappDatasource params',
      type: 'object',
      properties: {
        dappId: {
          description: 'DappId from DappRadar',
          type: 'integer',
        },
      },
      required: ['dappId'],
    };
  }

  private fetchDApp({ dappId, range }: { dappId: number; range?: Range }) {
    return this.httpClient.get<{
      results: DappRadarApp;
      page: number;
      pageCount: number;
    }>(`/dapps/${dappId}`, {
      params: {
        range,
      },
    });
  }
}
