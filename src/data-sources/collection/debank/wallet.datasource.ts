import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { Wallet } from '../../../entities/wallet.entity';
import { Unit, UnitId } from '../../../entities/entity';
import { USD } from '../../../common/currecies';
import { AbstractWalletDataSource } from '../../abstract.wallet.data-source';
import { Meta } from '../../abstract.data-source';
import { BadRequestException } from '@nestjs/common';
import { addLogging } from '../../../common/http';

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
  private httpClient: AxiosInstance;

  public static getName(): string {
    return `Debank wallet info`;
  }

  public static getDescription(): string {
    return `Data source powered by DeBank Cloud API that returns wallets' net worth. Consult https://docs.cloud.debank.com for more info.`;
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'DebankWalletDatasource configuration',
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

    addLogging('DebankWalletDatasource', this.httpClient);
  }

  async getItems({ walletIds }: Params): Promise<{
    items: Wallet[];
    meta: Meta;
  }> {
    if (!Array.isArray(walletIds)) {
      throw new BadRequestException('walletIds parameter was not specified');
    }

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
