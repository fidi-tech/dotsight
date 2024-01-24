import { AbstractChainDataSource } from '../../abstract.chain.data-source';
import { Meta } from '../../abstract.data-source';
import { CHAINS, ChainType } from './const';
import { BigQuery, BigQueryTimestamp } from '@google-cloud/bigquery';
import { TRANSACTIONS_COUNT, BLOCKS_COUNT } from './queries';
import { Chain, ENTITY } from '../../../entities/chain.entity';

type Config = Record<string, never>;

type Params = {
  chains: ChainType[];
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

  async getItems({ chains }: Params): Promise<{ items: Chain[]; meta: Meta }> {
    const datas = await Promise.all(
      chains.map(async (chain) => {
        const [dailyTransactionsCountData, dailyBlocksCountData] =
          await Promise.all([
            this.getDailyTransactionsCount(chain, 30),
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

          metrics: {
            dailyTransactionsCount:
              dailyTransactionsCountData[0].dailyTransactionsCount,
            dailyBlocksCount: dailyBlocksCountData[0].dailyBlocksCount,
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
}
