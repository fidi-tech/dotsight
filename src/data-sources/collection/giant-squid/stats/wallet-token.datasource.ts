import {
  AbstractWalletTokenDataSource,
  WalletTokenMeta,
} from '../../../abstract.wallet-token.data-source';
import { gql, GraphQLClient } from 'graphql-request';
import { WalletToken } from '../../../../entities/wallet-token.entity';

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

  constructor(config: Config) {
    super(config);
    this.client = new GraphQLClient(config.endpoint);
  }
  async getItems({
    walletIds,
  }: Params): Promise<{ items: WalletToken[]; meta: WalletTokenMeta }> {
    const response: { accounts: Array<{ id: string; free: string }> } =
      await this.client.request(
        GiantSquidStatsWalletTokenDataSource.FREE_COIN_QUERY,
        { ids: walletIds },
      );

    const items: WalletToken[] = [];
    for (const account of response.accounts) {
      const amount = +account.free / 10 ** this.config.coin.decimals;

      items.push({
        id: this.config.coin.id,
        entity: 'walletToken',
        meta: {
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
