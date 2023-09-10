import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { AbstractWalletTokenMiddleware } from '../../abstract.wallet-token.middleware';
import { AbstractWalletTokenDataSource } from '../../../data-sources/abstract.wallet-token.data-source';
import { WalletToken } from '../../../entities/wallet-token.entity';
import { EntityId, Unit, UnitId } from '../../../entities/entity';
import { addLogging } from '../../../common/http';

type Config = {
  key?: string;
  coinMapping: Record<string, string>;
};

type Params = {
  currencies?: string[];
};

export class CoingeckoWalletTokenPriceMiddleware extends AbstractWalletTokenMiddleware<
  Config,
  Params
> {
  private httpClient: AxiosInstance;
  private PRO_ENDPOINT = 'https://pro-api.coingecko.com/api/v3/';
  private PUBLIC_ENDPOINT = 'https://api.coingecko.com/api/v3';

  constructor(config: Config) {
    super(config);
    if (this.config.key) {
      this.httpClient = axios.create({
        baseURL: this.PRO_ENDPOINT,
        headers: new AxiosHeaders({
          'x-cg-pro-api-key': this.config.key,
        }),
      });
    } else {
      this.httpClient = axios.create({
        baseURL: this.PUBLIC_ENDPOINT,
      });
    }
    addLogging('CoingeckoWalletTokenPriceMiddleware', this.httpClient);
  }

  async transform(
    chunk: Awaited<
      ReturnType<AbstractWalletTokenDataSource<any, any>['getItems']>
    >,
    params: Params,
  ): ReturnType<AbstractWalletTokenDataSource<any, any>['getItems']> {
    const shouldBeEnriched: Map<EntityId, WalletToken> = new Map();
    for (const item of chunk.items) {
      if (this.shouldEnrich(item)) {
        shouldBeEnriched.set(item.id, item);
      }
    }

    const { items: enrichedItems, units } = await this.enrich(
      Array.from(shouldBeEnriched.values()),
      params,
    );

    const resultItems = [];
    for (const item of chunk.items) {
      if (shouldBeEnriched.get(item.id)) {
        resultItems.push(enrichedItems.get(item.id));
      } else {
        resultItems.push(item);
      }
    }

    return {
      items: resultItems,
      meta: {
        ...chunk.meta,
        units: {
          ...units,
          ...chunk.meta.units,
        },
      },
    };
  }

  private async enrich(
    items: Awaited<
      ReturnType<AbstractWalletTokenDataSource<any, any>['getItems']>
    >['items'],
    params: Params,
  ): Promise<{
    items: Map<EntityId, WalletToken>;
    units: Record<UnitId, Unit>;
  }> {
    const currencies = params.currencies || ['usd'];

    const supportedCoins = await this.getSupportedCoins();
    const coins = [];
    const itemToCoin = new Map();
    for (const item of items) {
      const itemCoinId = this.config.coinMapping[item.meta.id] ?? item.meta.id;
      const coin = supportedCoins.find(({ id }) => id === itemCoinId);
      if (coin) {
        coins.push(coin.id);
        itemToCoin.set(item, coin.id);
      }
    }

    let coinPrices: Record<string, Record<string, number>>;
    if (coins.length === 0) {
      coinPrices = {};
    } else {
      const { data } = await this.httpClient.get<
        Record<string, Record<string, number>>
      >('/simple/price', {
        params: {
          ids: coins.join(','),
          vs_currencies: currencies.join(','),
        },
      });
      coinPrices = data;
    }

    const resultItems: Map<string, WalletToken> = new Map();
    for (const item of items) {
      const coinId = itemToCoin.get(item);
      if (!coinId) {
        resultItems.set(item.id, item);
        continue;
      }

      const price = coinPrices[coinId];
      if (!price) {
        resultItems.set(item.id, item);
        continue;
      }

      let value = item.metrics.value;
      if (!value && item.metrics.amount) {
        value = {};
        for (const [currencyId, currencyPrice] of Object.entries(price)) {
          value[currencyId] = item.metrics.amount * currencyPrice;
        }
      }

      resultItems.set(item.id, {
        ...item,
        meta: {
          ...item.meta,
          price,
        },
        metrics: {
          ...item.metrics,
          value,
        },
      });
    }

    const units = {};
    for (const currency of currencies) {
      if (!units[currency]) {
        units[currency] = {
          id: currency,
        };
      }
    }

    return {
      items: resultItems,
      units,
    };
  }

  private shouldEnrich(item: WalletToken) {
    return !item.meta.price;
  }

  private async getSupportedCoins() {
    const response = await this.httpClient.get<
      Array<{ id: string; name: string; symbol: string }>
    >('/coins/list');
    return response.data;
  }
}
