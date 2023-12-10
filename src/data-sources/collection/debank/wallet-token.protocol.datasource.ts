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
    supply_token_list?: UserToken[];
    reward_token_list?: UserToken[];
    borrow_token_list?: UserToken[];
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

export class DebankWalletTokenProtocolDatasource extends AbstractWalletTokenDataSource<
  Config,
  Params
> {
  private httpClient: AxiosInstance;

  public static getName(): string {
    return `Debank wallet's Dapps`;
  }

  public static getDescription(): string {
    return `Data source powered by DeBank Cloud API that returns all of the dapps for the specified wallets. Consult https://docs.cloud.debank.com for more info.`;
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'DebankWalletTokenProtocolDatasource configuration',
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

    addLogging('DebankWalletTokenProtocolDatasource', this.httpClient);
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
        const protocols = await this.getAllComplexProtocols({ walletId });
        return {
          walletId,
          protocols,
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

    for (const { walletId, protocols } of data) {
      for (const protocol of protocols) {
        result.meta.protocols[protocol.id] = {
          id: protocol.id,
          name: protocol.name,
        };

        for (const item of protocol.portfolio_item_list) {
          for (const token of item?.detail?.supply_token_list || []) {
            result.meta.chains[token.chain] = {
              id: token.chain,
            };

            result.items.push({
              id: `${walletId}-${protocol.id}-${token.id}`,
              entity: 'walletToken',
              meta: {
                id: token.id,
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

  public static getParamsSchema(): object {
    return {
      title: 'Params',
      description: 'DebankWalletTokenProtocolDatasource params',
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
