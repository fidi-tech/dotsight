import { WalletDatasource } from '../../models/datasource/wallet.datasource';
import { GetItemsResult } from '../../models/datasource/datasource';
import { Wallet } from '../../common/wallet';
import axios, { Axios, AxiosHeaders } from 'axios';
import { Unit, UnitId } from '../../common/entity';
import { USD } from '../../common/currecies';

type Config = {
  key: string;
};

type Params = {
  walletIds: string[];
};

export class DebankWalletDatasource extends WalletDatasource<Config, Params> {
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

  async getItems({ walletIds }: Params): Promise<GetItemsResult<Wallet, null>> {
    const response = await this.getTotalBalance({ walletIds });

    const units: Record<UnitId, Unit> = {
      [USD.id]: USD,
    };
    const items: Wallet[] = [];

    for (const { walletId, totalUsdValue } of response) {
      items.push({
        id: walletId,
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
      units,
      items,
      meta: null,
    };
  }

  public async getTotalBalance({ walletIds }: Params): Promise<
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
