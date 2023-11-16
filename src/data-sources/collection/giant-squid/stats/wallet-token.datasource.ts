import {
  AbstractWalletTokenDataSource,
  WalletTokenMeta,
} from '../../../abstract.wallet-token.data-source';
import { gql, GraphQLClient } from 'graphql-request';
import { WalletToken } from '../../../../entities/wallet-token.entity';
import { BadRequestException } from '@nestjs/common';
import { URL_REGEXP } from '../../../../common/regexp';

type Config = {
  endpoint: string;
  coin: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
  };
};

type Params = {
  walletIds: string[];
};

export class GiantSquidStatsWalletTokenDataSource extends AbstractWalletTokenDataSource<
  Config,
  Params
> {
  static FREE_COIN_QUERY = gql`
    query freeCoinQuery($ids: [String!]!) {
      accounts(where: { id_in: $ids }) {
        id
        free
      }
    }
  `;

  private client: GraphQLClient;

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'GiantSquidStatsWalletTokenDataSource configuration',
      type: 'object',
      properties: {
        endpoint: {
          description:
            'GraphQL endpoint for the Giant Squid Stats API. Please visit https://docs.subsquid.io/giant-squid-api/gs-stats/ for more info',
          type: 'string',
          pattern: URL_REGEXP,
        },
        coin: {
          description: 'Coin specification for the selected network',
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Coin id to be used by engine to deduplicate data',
              minLength: 1,
            },
            name: {
              type: 'string',
              minLength: 1,
            },
            symbol: {
              type: 'string',
              minLength: 1,
              description: 'Coin symbol to be used, e.g. BTC or ETH',
            },
            decimals: {
              type: 'integer',
              exclusiveMinimum: 0,
              description: 'Coin decimals, e.g. 18',
            },
          },
          required: ['id', 'name', 'symbol', 'decimals'],
        },
      },
      required: ['endpoint', 'coin'],
    };
  }

  constructor(config: Config) {
    super(config);

    this.client = new GraphQLClient(config.endpoint);
  }
  async getItems({
    walletIds,
  }: Params): Promise<{ items: WalletToken[]; meta: WalletTokenMeta }> {
    if (!Array.isArray(walletIds)) {
      throw new BadRequestException(`walletIds param should be specified`);
    }

    const response: { accounts: Array<{ id: string; free: string }> } =
      await this.client.request(
        GiantSquidStatsWalletTokenDataSource.FREE_COIN_QUERY,
        { ids: walletIds },
      );

    const items: WalletToken[] = [];
    for (const account of response.accounts) {
      const amount = +account.free / 10 ** this.config.coin.decimals;

      items.push({
        id: `${account.id}-${this.config.coin.id}`,
        entity: 'walletToken',
        meta: {
          id: this.config.coin.id,
          walletId: account.id,
          name: this.config.coin.name,
          symbol: this.config.coin.symbol,
        },
        metrics: {
          amount,
        },
        historicalMetrics: {
          amount: [
            {
              timestamp: Math.floor(Date.now() / 1000),
              value: amount,
            },
          ],
        },
      });
    }

    return {
      items,
      meta: {
        units: {},
        protocols: {},
        chains: {},
      },
    };
  }
}
