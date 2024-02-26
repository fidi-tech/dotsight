import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { USD } from '../../../common/currecies';
import { AbstractWalletDataSource } from '../../abstract.wallet.data-source';
import { addLogging } from '../../../common/http';
import { Entity, Meta, Params } from '../../abstract.data-source';
import { metrics } from '../../../common/categories/collection/wallet/metrics';
import { presets } from '../../../common/categories/collection/wallet/presets';
import {
  MetricId,
  PresetId,
  SubcategoryId,
} from '../../../common/categories/abstract.category';
import { isEthereumAddress } from '../../../common/categories/collection/wallet/validators';

type Config = {
  key: string;
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

export class DebankWalletTokenDatasource extends AbstractWalletDataSource<Config> {
  private httpClient: AxiosInstance;

  public getCopyright(): { id: string; name: string; icon: string | null } {
    return {
      id: 'debank',
      name: 'Debank',
      icon: null,
    };
  }

  public static getName(): string {
    return `Debank wallet's tokens`;
  }

  public static getDescription(): string {
    return `Data source powered by DeBank Cloud API that returns all of the tokens for the specified wallets. Consult https://docs.cloud.debank.com for more info.`;
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

  async getItems({
    subcategories: walletIds,
  }: Params<typeof metrics>): Promise<{
    items: Entity<typeof metrics, typeof presets>[];
    meta: Meta;
  }> {
    const data = await Promise.all(
      walletIds.map(async (walletId) => {
        const tokens = await this.getWalletTokens({ walletId });
        return {
          walletId,
          tokens,
        };
      }),
    );

    const items: Record<string, Entity<typeof metrics, typeof presets>> = {};

    for (const { tokens } of data) {
      for (const token of tokens) {
        const id = `${token.id}-${token.chain}`;
        if (!items[id]) {
          items[id] = {
            id,
            name: token.name,
            icon: null,
            metrics: {
              amount: [
                {
                  timestamp: Math.floor(Date.now() / 1000),
                  value: token.amount,
                },
              ],
              price: [
                {
                  timestamp: Math.floor(Date.now() / 1000),
                  value: {
                    [USD.id]: token.price,
                  },
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
          };
        } else {
          // assuming one element in the time series here
          // @ts-expect-error bad typings
          items[id].metrics.amount[0].value += token.amount;
          // @ts-expect-error bad typings
          items[id].metrics.value[0].value[USD.id] +=
            token.amount * token.price;
        }
      }
    }

    return {
      items: Object.values(items),
      meta: {
        units: {
          [USD.id]: USD,
        },
      },
    };
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
          is_all: false,
        },
      },
    );
    return response.data;
  }

  static getSubcategories(subcategories: SubcategoryId[]) {
    return subcategories.filter((walletId) => isEthereumAddress(walletId));
  }

  static getMetrics(): MetricId[] {
    return [];
  }

  public static hasPreset(preset: PresetId): boolean {
    return ([presets.tokenContents.id] as PresetId[]).includes(preset);
  }
}
