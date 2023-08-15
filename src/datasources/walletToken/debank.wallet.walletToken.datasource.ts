import { GetItemsResult } from '../../models/datasource/datasource';
import { WalletToken } from '../../common/walletToken';
import axios, { Axios, AxiosHeaders } from 'axios';
import {
  Meta,
  WalletTokenDatasource,
} from '../../models/datasource/walletToken.datasource';
import { USD } from '../../common/currecies';

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

export class DebankWalletWalletTokenDatasource extends WalletTokenDatasource<
  Config,
  Params
> {
  private httpClient: Axios;

  constructor(props) {
    super(props);
    this.httpClient = axios.create({
      baseURL: 'https://pro-openapi.debank.com/v1',
      headers: new AxiosHeaders({
        AccessKey: this.config.key,
      }),
      transformRequest: (config) => {
        console.log(config);
        return config;
      },
    });
  }

  async getItems({
    walletIds,
  }: Params): Promise<GetItemsResult<WalletToken, Meta>> {
    const data = await Promise.all(
      walletIds.map(async (walletId) => {
        const tokens = await this.getWalletTokens({ walletId });
        return {
          walletId,
          tokens,
        };
      }),
    );

    const result: GetItemsResult<WalletToken, Meta> = {
      units: {
        [USD.id]: USD,
      },
      items: [],
      meta: {
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
          id: token.id,
          meta: {
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
          is_all: true,
        },
      },
    );
    return response.data;
  }
}
