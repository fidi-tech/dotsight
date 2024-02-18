import { Injectable } from '@nestjs/common';
import { collection } from '../../collection';
import { AbstractDataSource } from '../../abstract.data-source';
import { DataSource } from '../../entities/data-source.entity';
import {
  CategoryId,
  MetricId,
  SubcategoryId,
} from '../../../common/categories/abstract.category';

@Injectable()
export class DataSourceService {
  private datasources: DataSource[];

  constructor() {
    this.datasources = [
      {
        id: '1-bigquery-public-data-chains',
        type: 'bigquery-public-data-chains',
        config: {},
      },
      {
        id: '1-debank-wallet-tokens',
        type: 'debank-wallet-tokens',
        config: {
          key: process.env.DEBANK,
        },
      },
      {
        id: '1-debank-wallet-nft',
        type: 'debank-wallet-nft',
        config: {
          key: process.env.DEBANK,
        },
      },
      {
        id: '1-debank-wallet',
        type: 'debank-wallet',
        config: {
          key: process.env.DEBANK,
        },
      },
      {
        id: '1-chainlink-tokens',
        type: 'chainlink-tokens',
        config: {
          rpc: 'https://rpc.ankr.com/eth',
        },
      },
      {
        id: '1-dapp-radar-dapp',
        type: 'dapp-radar-dapp',
        config: {
          key: process.env.DAPP_RADAR,
        },
      },
    ];
  }

  async getDatasources(
    category: CategoryId,
    subcategories: SubcategoryId[],
    metrics?: MetricId[],
    preset?: MetricId,
  ): Promise<Array<AbstractDataSource<any, any, any, any>>> {
    const datasources = this.datasources;
    return datasources
      .map((datasource) => ({
        type: collection[
          datasource.type
        ] as (typeof collection)[keyof typeof collection],
        config: datasource.config,
      }))
      .filter(({ type }) => {
        return (
          type.getCategory() === category &&
          type.getSubcategories(subcategories).length > 0 &&
          ((metrics && type.getMetrics(metrics).length > 0) ||
            (preset && type.hasPreset(preset)))
        );
      })
      .map(({ type, config }) => new type(config as any));
  }
}
