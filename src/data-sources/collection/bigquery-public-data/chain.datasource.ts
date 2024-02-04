import { AbstractChainDataSource } from '../../abstract.chain.data-source';
import { Meta } from '../../abstract.data-source';
import { CHAINS, ChainType } from './const';
import { BigQuery, BigQueryTimestamp } from '@google-cloud/bigquery';
import { TRANSACTIONS_COUNT, BLOCKS_COUNT } from './queries';
import { Chain, ENTITY } from '../../../entities/chain.entity';
import { NetworkCategory } from '../../../common/categories/collection/network/network.category';
import { networks } from '../../../common/categories/collection/network/networks';
import {
  MetricId,
  SubcategoryId,
} from '../../../common/categories/abstract.category';

type Config = Record<string, never>;

type Params = {
  subcategories: SubcategoryId[];
};

export class BigQueryPublicDataChainDatasource extends AbstractChainDataSource<
  Config,
  Params
> {
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

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'BigQueryPublicDataChainDatasource configuration',
      type: 'object',
      properties: {},
      required: [],
    };
  }

  public static getParamsSchema(): object {
    return {
      title: 'Params',
      description: 'ChainlinkTokenDataSource params',
      type: 'object',
      properties: {
        chains: {
          description: "Which chains' data to show",
          type: 'array',
          items: {
            enum: Object.keys(CHAINS),
          },
        },
      },
      required: ['chains'],
    };
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
  }: Params): Promise<{ items: Chain[]; meta: Meta }> {
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
          entity: ENTITY,
          id: CHAINS[chain].id,

          meta: {
            name: CHAINS[chain].name,
          },

          historicalMetrics: {
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

  static getCategory() {
    // TODO refactor this
    return new NetworkCategory().getId();
  }

  static getSubcategories(subcategories: SubcategoryId[]) {
    // TODO refactor this
    return [networks[0].id].filter((subcategoryId) =>
      subcategories.includes(subcategoryId),
    );
  }

  static getMetrics(metrics: MetricId[]): MetricId[] {
    return ['dailyTransactionsCount', 'dailyBlocksCount'].filter((metricId) =>
      metrics.includes(metricId),
    );
  }
}
