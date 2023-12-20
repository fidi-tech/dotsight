import {
    AbstractWalletTokenDataSource,
    WalletTokenMeta,
  } from '../../abstract.wallet-token.data-source';
  import { gql, GraphQLClient } from 'graphql-request';
  import { WalletToken } from '../../../entities/wallet-token.entity';
  import { BadRequestException } from '@nestjs/common';
  
  type Config = {
    apiKey: string;
  };
  
  type Params = {
    walletIds: string[];
  };
  
  export class TheGraphErc20MainnetWalletTokenDatasource extends AbstractWalletTokenDataSource<
    Config,
    Params
  > {
    private client: GraphQLClient;
  
    static TOKENS_BY_WALLET_IDS = gql`
      query tokens($ids: [String!]!) {
        accounts(where: { id_in: $ids }) {
          id
          balances {
            token {
              id
              name
              symbol
            }
            balance
          }
        }
      }
    `;
  
    public static getName(): string {
      return `TheGraph ERC20 Balances Mainnet`;
    }
  
    public static getDescription(): string {
      return `https://thegraph.com/explorer/subgraphs/35AYsvtJ7SjD93JZcjHK7KTSFyC8h74YHkg2hTxRsRer`;
    }
  
    public static getConfigSchema(): object {
      return {
        title: 'Config',
        description: 'TheGraphErc20MainnetWalletTokenDatasource configuration',
        type: 'object',
        properties: {
          apiKey: {
            description:
              'API key for the TheGraph. Visit https://thegraph.com/docs/en/querying/querying-the-graph/ for more details',
            type: 'string',
            minLength: 1,
          },
        },
        required: ['apiKey'],
      };
    }
  
    constructor(config: Config) {
      super(config);
  
      this.client = new GraphQLClient(
        `https://gateway-arbitrum.network.thegraph.com/api/${config.apiKey}/subgraphs/id/35AYsvtJ7SjD93JZcjHK7KTSFyC8h74YHkg2hTxRsRer`,
      );
    }
  
    async getItems({
      walletIds,
    }: Params): Promise<{ items: WalletToken[]; meta: WalletTokenMeta }> {
      if (!Array.isArray(walletIds)) {
        throw new BadRequestException(`walletIds param should be specified`);
      }
  
      const response: {
        accounts: Array<{
          id: string;
          balances: Array<{
            balance: number;
            token: { id: string; name: string; symbol: string };
          }>;
        }>;
      } = await this.client.request(
        TheGraphErc20MainnetWalletTokenDatasource.TOKENS_BY_WALLET_IDS,
        { ids: walletIds },
      );
  
      const items: WalletToken[] = [];
      for (const account of response.accounts) {
        for (const balance of account.balances) {
          items.push({
            id: `${account.id}-${balance.token.id}`,
            entity: 'walletToken',
            meta: {
              id: balance.token.id,
              walletId: account.id,
              symbol: balance.token.symbol,
              name: balance.token.name,
            },
            metrics: {
              amount: +balance.balance / 10 ** 6,
            },
            historicalMetrics: {
              amount: [
                {
                  timestamp: Math.floor(Date.now() / 1000),
                  value: +balance.balance / 10 ** 6,
                },
              ],
            },
          });
        }
      }
  
      return {
        items,
        meta: {
          protocols: {},
          chains: {},
          units: {},
        },
      };
    }
  }