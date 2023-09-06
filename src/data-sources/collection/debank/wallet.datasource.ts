import axios, { Axios, AxiosHeaders } from 'axios';
import { Wallet } from '../../../entities/wallet.entity';
import { Unit, UnitId } from '../../../entities/entity';
import { USD } from '../../../common/currecies';
import { AbstractWalletDataSource } from '../../abstract.wallet.data-source';
import { Meta } from '../../abstract.data-source';

type Config = {
  key: string;
};

type Params = {
  walletIds: string[];
};

export class DebankWalletDatasource extends AbstractWalletDataSource<
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
    });
  }

  async getItems({ walletIds }: Params): Promise<{
    items: Wallet[];
    meta: Meta;
  }> {
    const response = await this.getTotalBalance({ walletIds });

    const units: Record<UnitId, Unit> = {
      [USD.id]: USD,
    };
    const items: Wallet[] = [];

    for (const { walletId, totalUsdValue } of response) {
      items.push({
        id: walletId,
        entity: 'wallet',
        meta: {},
        metrics: {
          netWorth: {
            [USD.id]: totalUsdValue,
          },
        },
        historicalMetrics: {
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

  private async getTotalBalance({ walletIds }: Params): Promise<
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
}
