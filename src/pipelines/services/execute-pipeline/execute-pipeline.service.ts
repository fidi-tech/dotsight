import { Injectable } from '@nestjs/common';
import { PipelineService } from '../pipeline/pipeline.service';
import { Pipeline, PipelineId } from '../../entities/pipeline.entity';
import { MapperId } from '../../../mappers/entities/mapper.entity';
import { MapperService } from '../../../mappers/services/mapper/mapper.service';
import { DataSourceService } from '../../../data-sources/services/data-source/data-source.service';
import { MixerService } from '../../../mixers/services/mixer/mixer.service';

@Injectable()
export class ExecutePipelineService {
  constructor(
    private readonly pipelineService: PipelineService,
    private readonly mapperService: MapperService,
    private readonly dataSourceService: DataSourceService,
    private readonly mixerService: MixerService,
  ) {}

  async executePipeline(
    pipelineId: PipelineId,
    mapperIds: MapperId[],
    params: Record<string, any>,
  ) {
    const pipeline = await this.pipelineService.findById(pipelineId);

    const mappers = mapperIds
      .map((id) => pipeline.mappers[id])
      .map((mapper) =>
        this.mapperService.instantiate(mapper.type, mapper.config),
      );

    const requiredEntities = mappers.reduce((acc, mapper) => {
      acc.push(...mapper.getRequiredEntities());
      return acc;
    }, []);
    const entitiesArray = await Promise.all(
      requiredEntities.map((entity) =>
        this.getEntities(pipeline, entity, params),
      ),
    );
    const items = {};
    const meta = {};
    for (let i = 0; i < requiredEntities.length; i++) {
      items[requiredEntities[i]] = entitiesArray[i].items;
      Object.assign(meta, entitiesArray[i].meta);
    }

    const result = {};
    for (let i = 0; i < mappers.length; i++) {
      result[mapperIds[i]] = mappers[i].map(items, params, meta);
    }
    return result;
  }

  private async getEntities(
    pipeline: Pipeline,
    entity: string,
    params: Record<string, any>,
  ) {
    const chunks = await Promise.all(
      pipeline.dataSources[entity].map((dataSource) =>
        this.dataSourceService
          .instantiate(dataSource.type, dataSource.config)
          .getItems(params),
      ),
    );

    const mixer = this.mixerService.instantiate(
      entity,
      pipeline.mixers[entity],
    );
    return await mixer.mix(...chunks);
  }
}
