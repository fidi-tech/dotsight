import axios, { AxiosHeaders, AxiosInstance } from 'axios';

import { USD } from '../../../common/currecies';
import { addLogging } from '../../../common/http';
import { NFTRaw } from './types';
import { AbstractWalletDataSource } from '../../abstract.wallet.data-source';
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

export class DebankWalletNFTDatasource extends AbstractWalletDataSource<Config> {
  private httpClient: AxiosInstance;

  public getCopyright(): { id: string; name: string; icon: string | null } {
    return {
      id: 'debank',
      name: 'Debank',
      icon: null,
    };
  }

  public static getName(): string {
    return `Debank wallet's NFTs`;
  }

  public static getDescription(): string {
    return `Data source powered by DeBank Cloud API that returns all of the NFT for the specified wallet. Consult https://docs.cloud.debank.com for more info.`;
  }

  constructor(id, props) {
    super(id, props);

    this.httpClient = axios.create({
      baseURL: 'https://pro-openapi.debank.com/v1',
      headers: new AxiosHeaders({
        AccessKey: this.config.key,
      }),
    });

    addLogging('DebankWalletNFTDatasource', this.httpClient);
  }

  async getItems({
    subcategories: walletIds,
  }: Params<typeof metrics>): Promise<{
    items: Entity<typeof metrics, typeof presets>[];
    meta: Meta;
  }> {
    const data = await Promise.all(
      walletIds.map((walletId) => this.getWalletNFTs({ walletId })),
    );

    return {
      items: data.flat().map((token) => ({
        id: `${token.contract_id}-${token.id}`,
        name: token.name,
        icon: token.thumbnail_url,
        metrics: {
          price: token.pay_token?.amount
            ? [
                {
                  timestamp: Math.floor(Date.now() / 1000),
                  value: {
                    [USD.id]: token.pay_token?.amount,
                  },
                },
              ]
            : [],
        },
      })),
      meta: {
        units: {
          [USD.id]: USD,
        },
      },
    };
  }

  async getWalletNFTs({ walletId }: { walletId: string }): Promise<NFTRaw[]> {
    const response = await this.httpClient.get<any[]>('/user/all_nft_list', {
      params: {
        id: walletId,
      },
    });
    return response.data;
  }

  static getSubcategories(subcategories: SubcategoryId[]) {
    return subcategories.filter((walletId) => isEthereumAddress(walletId));
  }

  static getMetrics(): MetricId[] {
    return [];
  }

  public static hasPreset(preset: PresetId): boolean {
    return ([presets.nfts.id] as PresetId[]).includes(preset);
  }
}
