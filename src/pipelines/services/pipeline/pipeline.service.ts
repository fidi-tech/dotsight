import { Injectable } from '@nestjs/common';
import { Pipeline, PipelineId } from '../../entities/pipeline.entity';
import { DataSource } from '../../../data-sources/entities/data-source.entity';
import pipelinesConfig from './pipelines.config';
import { Mixer } from '../../../mixers/entities/mixer.entity';
import { Middleware } from '../../../middlewares/entities/middleware.entity';
import { Mapper } from '../../../mappers/entities/mapper.entity';

@Injectable()
export class PipelineService {
  private pipelines: Record<PipelineId, Pipeline> = {};

  constructor() {
    for (const pipelineConfig of pipelinesConfig.pipelines) {
      const pipeline = new Pipeline();
      pipeline.id = pipelineConfig.id;

      pipeline.dataSources = {};
      for (const entity in pipelineConfig.dataSources) {
        if (!pipeline.dataSources[entity]) {
          pipeline.dataSources[entity] = [];
        }

        for (const dataSourceConfig of pipelineConfig.dataSources[entity]) {
          const dataSource = new DataSource();
          dataSource.id = dataSourceConfig.id;
          dataSource.type = dataSourceConfig.type;
          dataSource.config = dataSourceConfig.config;
          pipeline.dataSources[entity].push(dataSource);
        }
      }

      pipeline.mixers = {};
      for (const entity in pipelineConfig.mixers) {
        pipeline.mixers[entity] = new Mixer();
        pipeline.mixers[entity].entity = entity;
        pipeline.mixers[entity].config = pipelineConfig.mixers[entity];
      }

      pipeline.middlewares = {};
      for (const entity in pipelineConfig.middlewares) {
        if (!pipeline.middlewares[entity]) {
          pipeline.middlewares[entity] = [];
        }

        for (const middlewareConfig of pipelineConfig.middlewares[entity]) {
          const middleware = new Middleware();
          middleware.id = middlewareConfig.id;
          middleware.type = middlewareConfig.type;
          middleware.config = middlewareConfig.config;
          pipeline.middlewares[entity].push(middleware);
        }
      }

      pipeline.mappers = {};
      for (const mapperConfig of pipelineConfig.mappers) {
        const mapper = new Mapper();
        mapper.id = mapperConfig.id;
        mapper.type = mapperConfig.type;
        mapper.config = mapperConfig.config;
        pipeline.mappers[mapper.id] = mapper;
      }

      this.pipelines[pipeline.id] = pipeline;
    }
  }

  async findById(id: PipelineId): Promise<Pipeline> {
    return this.pipelines[id];
  }
}
