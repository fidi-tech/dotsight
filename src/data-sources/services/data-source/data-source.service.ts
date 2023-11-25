import { Injectable } from '@nestjs/common';
import { collection } from '../../collection';
import { AbstractDataSource } from '../../abstract.data-source';
import { Pipeline } from '../../../pipelines/entities/pipeline.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from '../../entities/data-source.entity';
import { ApiProperty } from '@nestjs/swagger';

class DataSourceNotFound extends Error {
  constructor(type) {
    super(`Datasource with type "${type}" not found`);
  }
}

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
  constructor(
    @InjectRepository(DataSource)
    private readonly dataSourceRepository: Repository<DataSource>,
  ) {}

  instantiate(
    type: string,
    config: object,
  ): AbstractDataSource<any, any, any, any> {
    const dataSource = collection[type];
    if (!dataSource) {
      throw new DataSourceNotFound(type);
    }
    return new dataSource(config);
  }

  getEntityByType(type: string): string {
    const dataSource = collection[type];
    if (!dataSource) {
      throw new DataSourceNotFound(type);
    }
    return dataSource.getEntity();
  }

  private checkTypeAndConfig(type: string, config: object) {
    this.instantiate(type, config);
  }

  async create(pipeline: Pipeline, type: string, config: object) {
    this.checkTypeAndConfig(type, config);

    const dataSource = this.dataSourceRepository.create({
      pipeline,
      type,
      config,
    });
    return this.dataSourceRepository.save(dataSource);
  }

  getDatasourcesByEntity(entity: string): Array<DatasourceSuggestion> {
    return Object.entries(collection)
      .filter(([, datasource]) => datasource.getEntity() === entity)
      .map(([type, dataSource]) => ({
        name: dataSource.getName(),
        description: dataSource.getDescription(),
        type,
        configSchema: dataSource.getConfigSchema(),
      }));
  }
}
