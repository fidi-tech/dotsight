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
    ];
  }

  async getDatasources(
    category: CategoryId,
    subcategories: SubcategoryId[],
    metrics: MetricId[],
  ): Promise<Array<AbstractDataSource<any, any, any, any>>> {
    const datasources = this.datasources;
    return datasources
      .map((datasource) => ({
        type: collection[datasource.type],
        config: datasource.config,
      }))
      .filter(
        ({ type }) =>
          type.getCategory() === category &&
          type.getSubcategories(subcategories).length > 0 &&
          type.getMetrics(metrics).length > 0,
      )
      .map(({ type, config }) => new type(config));
  }
}
