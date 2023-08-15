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

export type PortfolioItemObject = {
  stats: {
    asset_usd_value: number;
    debt_usd_value: number;
    net_usd_value: number;
  };
  name:
    | 'Yield'
    | 'Deposit'
    | 'Staked'
    | 'Locked'
    | 'Farming'
    | 'Leveraged Farming'
    | 'Lending'
    | 'Vesting'
    | 'Rewards'
    | 'Liquidity Pool'
    | 'Options Seller'
    | 'Options Buyer'
    | 'Insurance Seller'
    | 'Insurance Buyer'
    | 'Investment'
    | 'TokenSets'
    | 'Governance'
    | 'Perpetuals'
    | 'Wallet';
  detail: {
    supply_token_list: UserToken[];
    reward_token_list: UserToken[];
    borrow_token_list: UserToken[];
  };
};

export type UserProtocol = {
  id: string;
  chain: string;
  name: string;
  logo_url: string;
  site_url: string;
  net_usd_value: number;
  asset_usd_value: number;
  debt_usd_value: number;
  portfolio_item_list: PortfolioItemObject[];
};

export class DebankProtocolsWalletTokenDatasource extends WalletTokenDatasource<
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
        const protocols = await this.getAllComplexProtocols({ walletId });
        return {
          walletId,
          protocols,
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

    for (const { walletId, protocols } of data) {
      for (const protocol of protocols) {
        result.meta.protocols[protocol.id] = {
          id: protocol.id,
          name: protocol.name,
        };

        for (const item of protocol.portfolio_item_list) {
          for (const token of item.detail.supply_token_list) {
            result.meta.chains[token.chain] = {
              id: token.chain,
            };

            result.items.push({
              id: `${walletId}-${protocol.id}-${token.id}`,
              meta: {
                walletId: walletId,
                protocolId: protocol.id,
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
      }
    }

    return result;
  }

  async getAllComplexProtocols({
    walletId,
  }: {
    walletId: string;
  }): Promise<UserProtocol[]> {
    const response = await this.httpClient.get<UserProtocol[]>(
      '/user/all_complex_protocol_list',
      {
        params: {
          id: walletId,
        },
      },
    );
    return response.data;
  }
}
