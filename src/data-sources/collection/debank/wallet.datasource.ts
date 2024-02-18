import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { USD } from '../../../common/currecies';
import { AbstractWalletDataSource } from '../../abstract.wallet.data-source';
import { Entity, Meta, Params, Unit, UnitId } from '../../abstract.data-source';
import { addLogging } from '../../../common/http';
import { metrics } from '../../../common/categories/collection/wallet/metrics';
import { presets } from '../../../common/categories/collection/wallet/presets';
import {
  MetricId,
  SubcategoryId,
} from '../../../common/categories/abstract.category';
import { isEthereumAddress } from '../../../common/categories/collection/wallet/validators';

type Config = {
  key: string;
};

export class DebankWalletDatasource extends AbstractWalletDataSource<Config> {
  private httpClient: AxiosInstance;

  public static getName(): string {
    return `Debank wallet info`;
  }

  public static getDescription(): string {
    return `Data source powered by DeBank Cloud API that returns wallets' net worth. Consult https://docs.cloud.debank.com for more info.`;
  }

  constructor(props) {
    super(props);

    this.httpClient = axios.create({
      baseURL: 'https://pro-openapi.debank.com/v1',
      headers: new AxiosHeaders({
        AccessKey: this.config.key,
      }),
    });

    addLogging('DebankWalletDatasource', this.httpClient);
  }

  async getItems({
    subcategories: walletIds,
  }: Params<typeof metrics>): Promise<{
    items: Entity<typeof metrics, typeof presets>[];
    meta: Meta;
  }> {
    const response = await this.getTotalBalance({ walletIds });

    const units: Record<UnitId, Unit> = {
      [USD.id]: USD,
    };
    const items: Entity<typeof metrics, typeof presets>[] = [];

    for (const { walletId, totalUsdValue } of response) {
      items.push({
        id: walletId,
        name: walletId,
        icon: null,
        metrics: {
          netWorth: [
            {
              timestamp: Math.floor(Date.now() / 1000),
              value: {
                [USD.id]: totalUsdValue,
              },
            },
          ],
        },
      });
    }

    return {
      items,
      meta: {
        units,
      },
    };
  }

  private async getTotalBalance({
    walletIds,
  }: {
    walletIds: string[];
  }): Promise<
    Array<{
      walletId;
      totalUsdValue: number;
    }>
  > {
    return await Promise.all(
      walletIds.map(async (walletId) => {
        const response = await this.httpClient.get<{ total_usd_value: number }>(
          '/user/total_balance',
          {
            params: {
              id: walletId,
            },
          },
        );
        return {
          walletId,
          totalUsdValue: response.data.total_usd_value,
        };
      }),
    );
  }

  static getSubcategories(subcategories: SubcategoryId[]) {
    return subcategories.filter((walletId) => isEthereumAddress(walletId));
  }

  static getMetrics(metrics: MetricId[]): MetricId[] {
    return ['netWorth'].filter((metricId) => metrics.includes(metricId));
  }

  public static hasPreset(): boolean {
    return false;
  }
}
