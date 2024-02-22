import axios, { AxiosHeaders, AxiosInstance } from 'axios';

import { USD } from '../../../common/currecies';
import {
  Entity,
  HISTORICAL_SCOPE,
  Meta,
  Params,
} from '../../abstract.data-source';
import { addLogging } from '../../../common/http';
import { AbstractNetworkDataSource } from '../../abstract.network.data-source';
import { metrics as networkMetrics } from '../../../common/categories/collection/network/metrics';
import {
  Metrics,
  Presets,
} from '../../../common/categories/collection/network/network.category';
import {
  MetricId,
  PresetId,
  SubcategoryId,
} from '../../../common/categories/abstract.category';
import { dapps } from '../../../common/categories/collection/network/dapps';

type Config = {
  key: string;
  endpoint: string;
};

type DappRadarApp = {
  dappId: number;
  name: string;
  logo: string | null;
  chains: string[];
  metrics: Record<string, number>;
};

const METRIC_MAP = {
  transactions: 'dailyTransactionsCount',
  uaw: 'dailyUaw',
  volume: 'dailyVolume',
} as const;
const REVERSE_METRIC_MAP = {
  dailyTransactionsCount: 'transactions',
  dailyUaw: 'uaw',
  dailyVolume: 'volume',
};

export class DappRadarDappDatasource extends AbstractNetworkDataSource<Config> {
  private httpClient: AxiosInstance;

  public static getName(): string {
    return `DappRadar DApp information`;
  }

  public static getDescription(): string {
    return `Data source powered by DappRadar API that returns users, transactions, volume, balance for a specific DApp, powered by DappRadar API. Consult https://api-docs.dappradar.com/#operation/getDappItem for more info.`;
  }

  constructor(config: Config) {
    super(config);

    console.log(this.config);

    this.httpClient = axios.create({
      baseURL: 'https://apis.dappradar.com/v2',
      headers: new AxiosHeaders({
        'X-API-KEY': this.config.key,
      }),
    });

    addLogging('DappRadarDappDatasource', this.httpClient);
  }

  async getItems({
    subcategories: dappIds,
    metrics,
    historicalScope,
  }: Params<typeof networkMetrics>): Promise<{
    items: Entity<Metrics, Presets>[];
    meta: Meta;
  }> {
    const items: Record<string, Entity<Metrics, Presets>> = {};

    const dateTo = new Date();
    let dateFrom;
    switch (historicalScope) {
      case HISTORICAL_SCOPE.DAY:
        dateFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);
      case HISTORICAL_SCOPE.MONTH:
      default:
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const promises = [];
    for (const dappId of dappIds) {
      for (const metric of metrics) {
        if (!REVERSE_METRIC_MAP[metric]) {
          continue;
        }

        promises.push(
          this.fetchDAppMetric(items, {
            dappId,
            metric: REVERSE_METRIC_MAP[metric],
            dateFrom,
            dateTo,
          }).catch(console.error),
        );
      }
    }

    await Promise.all(promises);

    return {
      items: Object.values(items),
      meta: {
        units: {
          [USD.id]: USD,
        },
      },
    };
  }

  private async fetchDAppMetric(
    items: Record<string, Entity<Metrics, Presets>>,
    {
      dappId,
      metric,
      dateFrom,
      dateTo,
    }: {
      dappId: string;
      metric: 'transactions' | 'uaw' | 'volume';
      dateFrom: Date;
      dateTo: Date;
    },
  ) {
    const { data } = (await this.httpClient.get<{
      results: DappRadarApp;
      page: number;
      pageCount: number;
    }>(`/dapps/${dappId}/history/${metric}`, {
      params: {
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
      },
    })) as any as {
      data: {
        results: Array<{ timestamp: number; date: string; value: number }>;
      };
    };

    if (!items[dappId]) {
      items[dappId] = {
        id: dappId,
        name: dappId,
        icon: null,
        metrics: {},
      };
    }

    items[dappId].metrics[METRIC_MAP[metric]] = data.results.map((item) => ({
      timestamp: item.timestamp,
      value: item.value,
    }));
  }

  static getSubcategories(subcategories: SubcategoryId[]) {
    return dapps.map((dapp) => dapp.id);
  }

  static getMetrics(metrics: MetricId[]): MetricId[] {
    return Object.keys(REVERSE_METRIC_MAP).filter((metric) =>
      metrics.includes(metric),
    );
  }

  public static hasPreset(preset: PresetId): boolean {
    return false;
  }
}
