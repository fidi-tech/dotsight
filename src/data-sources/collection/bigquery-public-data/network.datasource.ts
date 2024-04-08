import { Entity, Meta, Params } from '../../abstract.data-source';
import { CHAINS } from './const';
import { BigQuery, BigQueryTimestamp } from '@google-cloud/bigquery';
import {
  TRANSACTIONS_COUNT,
  BLOCKS_COUNT,
  BLOCK_PRODUCTION_RATE,
} from './queries';
import {
  MetricId,
  PresetId,
  SubcategoryId,
} from '../../../common/categories/abstract.category';
import { AbstractNetworkDataSource } from '../../abstract.network.data-source';
import { metrics as networkMetrics } from '../../../common/categories/collection/network/metrics';
import {
  Metrics,
  Presets,
} from '../../../common/categories/collection/network/network.category';

type Config = Record<string, never>;

export class BigQueryPublicDataChainDatasource extends AbstractNetworkDataSource<Config> {
  private bigquery: BigQuery;

  constructor(id, props) {
    super(id, props);

    this.bigquery = new BigQuery();
  }

  public getCopyright(): { id: string; name: string; icon: string | null } {
    return {
      id: 'bigquery-public-data',
      name: 'BigQuery Public Dataset',
      icon: null,
    };
  }

  public static getName(): string {
    return `BigQuery Public Dataset`;
  }

  public static getDescription(): string {
    return `Consult https://cloud.google.com/blockchain-analytics/docs/supported-datasets for more info.`;
  }

  private async getDailyTransactionsCount(chain: string, daysAgo: number) {
    const options = {
      query: TRANSACTIONS_COUNT(CHAINS[chain], daysAgo),
      location: CHAINS[chain].location,
    };

    const [job] = await this.bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();

    return rows.map(
      ({
        day,
        f0_: dailyTransactionsCount,
      }: {
        day: BigQueryTimestamp;
        f0_: number;
      }) => ({
        timestamp: new Date(day.value),
        dailyTransactionsCount,
      }),
    );
  }

  private async getDailyAverageBlockTime(chain: string, daysAgo: number) {
    const options = {
      query: BLOCK_PRODUCTION_RATE(CHAINS[chain], daysAgo),
      location: CHAINS[chain].location,
    };

    const [job] = await this.bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();

    return rows.map(
      ({
        day,
        f0_: dailyAverageBlockTime,
      }: {
        day: BigQueryTimestamp;
        f0_: number;
      }) => ({
        timestamp: new Date(day.value),
        dailyAverageBlockTime,
      }),
    );
  }

  private async getDailyBlocksCount(chain: string, daysAgo: number) {
    const options = {
      query: BLOCKS_COUNT(CHAINS[chain], daysAgo),
      location: CHAINS[chain].location,
    };

    const [job] = await this.bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();

    return rows.map(
      ({
        day,
        f0_: dailyBlocksCount,
      }: {
        day: BigQueryTimestamp;
        f0_: number;
      }) => ({
        timestamp: new Date(day.value),
        dailyBlocksCount,
      }),
    );
  }

  async getItems({ subcategories }: Params<typeof networkMetrics>): Promise<{
    items: Entity<Metrics, Presets>[];
    meta: Meta;
  }> {
    const networks =
      BigQueryPublicDataChainDatasource.getSubcategories(subcategories);
    const datas = await Promise.all(
      networks.map(async (chain) => {
        const [
          dailyTransactionsCountData,
          dailyBlocksCountData,
          dailyAverageBlockTimeData,
        ] = await Promise.all([
          this.getDailyTransactionsCount(chain, 30),
          this.getDailyBlocksCount(chain, 30),
          this.getDailyAverageBlockTime(chain, 30),
        ]);

        return {
          chain,
          dailyTransactionsCountData,
          dailyBlocksCountData,
          dailyAverageBlockTimeData,
        };
      }),
    );

    return {
      items: datas.map(
        ({
          chain,
          dailyTransactionsCountData,
          dailyBlocksCountData,
          dailyAverageBlockTimeData,
        }) => ({
          id: CHAINS[chain].id,
          name: CHAINS[chain].name,
          icon: null,

          metrics: {
            dailyTransactionsCount: dailyTransactionsCountData.map(
              ({ timestamp, dailyTransactionsCount }) => ({
                timestamp: Math.floor(timestamp.getTime() / 1000),
                value: dailyTransactionsCount,
              }),
            ),
            dailyBlocksCount: dailyBlocksCountData.map(
              ({ timestamp, dailyBlocksCount }) => ({
                timestamp: Math.floor(timestamp.getTime() / 1000),
                value: dailyBlocksCount,
              }),
            ),
            dailyAverageBlockTime: dailyAverageBlockTimeData.map(
              ({ timestamp, dailyAverageBlockTime }) => ({
                timestamp: Math.floor(timestamp.getTime() / 1000),
                value: dailyAverageBlockTime,
              }),
            ),
          },
        }),
      ),
      meta: {
        units: {},
      },
    };
  }

  static getSubcategories(subcategories: SubcategoryId[]) {
    return ['ethereum', 'avalanche', 'arbitrum'].filter((network) =>
      subcategories.includes(network),
    );
  }

  static getMetrics(metrics: MetricId[]): MetricId[] {
    return [
      'dailyTransactionsCount',
      'dailyBlocksCount',
      'dailyAverageBlockTime',
    ].filter((metricId) => metrics.includes(metricId));
  }

  public static hasPreset(preset: PresetId): boolean {
    return false;
  }
}
