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
  
  export class TheGraphErc20AvalancheWalletTokenDatasource extends AbstractWalletTokenDataSource<
    Config,
    Params
  > {
    private client: GraphQLClient;
  
    static TOKENS_BY_WALLET_IDS = gql`
      query tokens($ids: [String!]!) {
        account(id: $ids) {
          id
          balances {
            token {
              id
              symbol
            }
            amount
          }
        }
      }
    `;
  
    public static getName(): string {
      return `TheGraph ERC20 Balances Avalanche`;
    }
  
    public static getDescription(): string {
      return `https://thegraph.com/hosted-service/subgraph/omni-x-nft/erc20-holder-avax-mainnet`;
    }
  
    public static getConfigSchema(): object {
      return {
        title: 'Config',
        description: 'TheGraphErc20AvalancheWalletTokenDatasource configuration',
        type: 'object',
        properties: {
          apiKey: {
            description:
              'API key for TheGraph. Visit https://thegraph.com/docs/en/querying/querying-the-graph/ for more details',
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
        `https://api.thegraph.com/subgraphs/name/omni-x-nft/erc20-holder-avax-mainnet`,
      );
    }
  
    async getItems({
      walletIds,
    }: Params): Promise<{ items: WalletToken[]; meta: WalletTokenMeta }> {
      if (!Array.isArray(walletIds)) {
        throw new BadRequestException(`walletIds param should be specified`);
      }
  
      const response: {
        account: {
          id: string;
          balances: Array<{
            amount: number;
            token: { id: string; symbol: string };
          }>;
        };
      } = await this.client.request(
        TheGraphErc20AvalancheWalletTokenDatasource.TOKENS_BY_WALLET_IDS,
        { ids: walletIds },
      );
  
      const items: WalletToken[] = [];
      for (const balance of response.account.balances) {
        items.push({
          id: `${response.account.id}-${balance.token.id}`,
          entity: 'walletToken',
          meta: {
            id: balance.token.id,
            walletId: response.account.id,
            symbol: balance.token.symbol,
          },
          metrics: {
            amount: balance.amount,
          },
          historicalMetrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: balance.amount,
              },
            ],
          },
        });
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
  