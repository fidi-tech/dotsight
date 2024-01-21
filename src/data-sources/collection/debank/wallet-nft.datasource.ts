import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { BadRequestException } from '@nestjs/common';

import { USD } from '../../../common/currecies';
import { addLogging } from '../../../common/http';
import {
  AbstractWalletNFTDataSource,
  WalletNFTMeta,
} from '../../abstract.wallet-nft.data-source';
import { NFTRaw } from './types';
import { WalletNFT } from '../../../entities/wallet-nft.entity';
import { normalizeNFT } from './helpers';

type Config = {
  key: string;
};

type Params = {
  walletId: string;
};

export class DebankWalletNFTDatasource extends AbstractWalletNFTDataSource<
  Config,
  Params
> {
  private httpClient: AxiosInstance;

  public static getName(): string {
    return `Debank wallet's NFTs`;
  }

  public static getDescription(): string {
    return `Data source powered by DeBank Cloud API that returns all of the NFT for the specified wallet. Consult https://docs.cloud.debank.com for more info.`;
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'DebankWalletNFTDatasource configuration',
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

    addLogging('DebankWalletNFTDatasource', this.httpClient);
  }

  async getItems({ walletId }: Params): Promise<{
    items: WalletNFT[];
    meta: WalletNFTMeta;
  }> {
    if (!walletId) {
      throw new BadRequestException('walletIds parameter was not specified');
    }

    const tokens = await this.getWalletNFTs({ walletId });
    return {
      items: tokens.map((token) => ({
        id: `${token.contract_id}-${token.id}`,
        entity: 'walletNFT',
        meta: normalizeNFT(token),
        metrics: {},
        historicalMetrics: {},
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

  public static getParamsSchema(): object {
    return {
      title: 'Params',
      description: 'DebankWalletTokenDatasource params',
      type: 'object',
      properties: {
        walletId: {
          description: 'Wallet',
          type: 'string',
        },
      },
      required: ['walletId'],
    };
  }
}
