import { Entity, Meta, Params } from '../../abstract.data-source';
import { CHAINS, ChainType } from './const';
import { BigQuery, BigQueryTimestamp } from '@google-cloud/bigquery';
import { TRANSACTIONS_COUNT, BLOCKS_COUNT } from './queries';
import { networks } from '../../../common/categories/collection/network/networks';
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

  constructor(props) {
    super(props);

    this.bigquery = new BigQuery();
  }

  public static getName(): string {
    return `BigQuery Public Dataset`;
  }

  public static getDescription(): string {
    return `Consult https://cloud.google.com/blockchain-analytics/docs/supported-datasets for more info.`;
  }

  private async getDailyTransactionsCount(chain: ChainType, daysAgo: number) {
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

  private async getDailyBlocksCount(chain: ChainType, daysAgo: number) {
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

  async getItems({
    subcategories,
    metrics,
    preset,
  }: Params<typeof networkMetrics>): Promise<{
    items: Entity<Metrics, Presets>[];
    meta: Meta;
  }> {
    const datas = await Promise.all(
      subcategories.map(async (chain) => {
        const [dailyTransactionsCountData, dailyBlocksCountData] =
          await Promise.all([
            // @ts-expect-error TODO fix this
            this.getDailyTransactionsCount(chain, 30),
            // @ts-expect-error TODO fix this
            this.getDailyBlocksCount(chain, 30),
          ]);

        return {
          chain,
          dailyTransactionsCountData,
          dailyBlocksCountData,
        };
      }),
    );

    return {
      items: datas.map(
        ({ chain, dailyTransactionsCountData, dailyBlocksCountData }) => ({
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
          },
        }),
      ),
      meta: {
        units: {},
      },
    };
  }

  static getSubcategories(subcategories: SubcategoryId[]) {
    return Object.values(networks)
      .filter((network) => subcategories.includes(network.id))
      .map((network) => network.id);
  }

  static getMetrics(metrics: MetricId[]): MetricId[] {
    return ['dailyTransactionsCount', 'dailyBlocksCount'].filter((metricId) =>
      metrics.includes(metricId),
    );
  }

  public static hasPreset(preset: PresetId): boolean {
    return false;
  }
}
