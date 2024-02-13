import { Injectable } from '@nestjs/common';
import { collection } from '../../collection';
import { AbstractDataSource } from '../../abstract.data-source';
import { DataSource } from '../../entities/data-source.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  CategoryId,
  MetricId,
  SubcategoryId,
} from '../../../common/categories/abstract.category';

export class DatasourceSuggestion {
  @ApiProperty({
    description: "data source's name",
  })
  name: string;

  @ApiProperty({
    description: "data source's description",
  })
  description: string;

  @ApiProperty({
    description: "data source's type",
  })
  type: string;

  @ApiProperty({
    description: "data source's config schema",
  })
  configSchema: object;
}

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
      .map(({ type, config }) => new type(config));
  }
}
