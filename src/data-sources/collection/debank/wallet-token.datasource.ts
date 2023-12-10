import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { WalletToken } from '../../../entities/wallet-token.entity';
import { USD } from '../../../common/currecies';
import {
  AbstractWalletTokenDataSource,
  WalletTokenMeta,
} from '../../abstract.wallet-token.data-source';
import { BadRequestException } from '@nestjs/common';
import { addLogging } from '../../../common/http';

type Config = {
  key: string;
};

type Params = {
  walletIds: string[];
};

type UserToken = {
  id: string;
  chain: string;
  name: string;
  symbol: string;
  decimals: number;
  logo_url: string | null;
  protocol_id: string;
  is_verified: boolean;
  is_core: boolean;
  is_wallet: boolean;
  price: number;
  amount: number;
  raw_amount: number;
  raw_amount_hex_str: string;
  time_at: number;
};

export class DebankWalletTokenDatasource extends AbstractWalletTokenDataSource<
  Config,
  Params
> {
  private httpClient: AxiosInstance;

  public static getName(): string {
    return `Debank wallet's tokens`;
  }

  public static getDescription(): string {
    return `Data source powered by DeBank Cloud API that returns all of the tokens for the specified wallets. Consult https://docs.cloud.debank.com for more info.`;
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'DebankWalletTokenDatasource configuration',
      type: 'object',
      properties: {
        key: {
          description: 'API key for the DeBank Cloud API',
          type: 'string',
          minLength: 1,
        },
      },
      required: ['key'],
    };
  }

  constructor(props) {
    super(props);

    this.httpClient = axios.create({
      baseURL: 'https://pro-openapi.debank.com/v1',
      headers: new AxiosHeaders({
        AccessKey: this.config.key,
      }),
    });

    addLogging('DebankWalletTokenDatasource', this.httpClient);
  }

  async getItems({ walletIds }: Params): Promise<{
    items: WalletToken[];
    meta: WalletTokenMeta;
  }> {
    if (!Array.isArray(walletIds)) {
      throw new BadRequestException('walletIds parameter was not specified');
    }

    const data = await Promise.all(
      walletIds.map(async (walletId) => {
        const tokens = await this.getWalletTokens({ walletId });
        return {
          walletId,
          tokens,
        };
      }),
    );

    const result: {
      items: WalletToken[];
      meta: WalletTokenMeta;
    } = {
      items: [],
      meta: {
        units: {
          [USD.id]: USD,
        },
        protocols: {},
        chains: {},
      },
    };

    for (const { walletId, tokens } of data) {
      for (const token of tokens) {
        if (!result.meta.chains[token.chain]) {
          result.meta.chains[token.chain] = {
            id: token.chain,
          };
        }

        result.items.push({
          id: `${walletId}-${token.id}`,
          entity: 'walletToken',
          meta: {
            id: token.id,
            walletId,
            symbol: token.symbol,
            iconUrl: token.logo_url,
            name: token.name,
            protocolId: null,
            chainId: token.chain,
            price: {
              [USD.id]: token.price,
            },
          },
          metrics: {
            amount: token.amount,
            value: {
              [USD.id]: token.amount * token.price,
            },
          },
          historicalMetrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: token.amount,
              },
            ],
            value: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: {
                  [USD.id]: token.amount * token.price,
                },
              },
            ],
          },
        });
      }
    }

    return result;
  }

  async getWalletTokens({
    walletId,
  }: {
    walletId: string;
  }): Promise<UserToken[]> {
    const response = await this.httpClient.get<UserToken[]>(
      '/user/all_token_list',
      {
        params: {
          id: walletId,
        },
      },
    );
    return response.data;
  }

  public static getParamsSchema(): object {
    return {
      title: 'Params',
      description: 'DebankWalletTokenDatasource params',
      type: 'object',
      properties: {
        walletIds: {
          description: 'Wallets',
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['walletIds'],
    };
  }
}
