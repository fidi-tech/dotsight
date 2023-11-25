import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PipelineService } from '../pipeline/pipeline.service';
import { Pipeline } from '../../entities/pipeline.entity';
import { MapperCode } from '../../../mappers/entities/mapper.entity';
import { MapperService } from '../../../mappers/services/mapper/mapper.service';
import { DataSourceService } from '../../../data-sources/services/data-source/data-source.service';
import { MixerService } from '../../../mixers/services/mixer/mixer.service';
import { MiddlewareService } from '../../../middlewares/services/middleware/middleware.service';

@Injectable()
export class ExecutePipelineService {
  constructor(
    private readonly pipelineService: PipelineService,
    private readonly mapperService: MapperService,
    private readonly dataSourceService: DataSourceService,
    private readonly mixerService: MixerService,
    private readonly middlewareService: MiddlewareService,
  ) {}

  async executePipeline(
    pipeline: Pipeline,
    mapperCodes: MapperCode[],
    params: Record<string, any>,
  ) {
    if (mapperCodes.length === 0) {
      throw new BadRequestException(`No mapperIds specified`);
    }

    const mappers = mapperCodes
      .map((code) => {
        const mapper = pipeline.mappers[code];
        if (!mapper) {
          throw new NotFoundException(`Mapper "${code}" not found`);
        }
        return mapper;
      })
      .map((mapper) =>
        this.mapperService.instantiate(mapper.type, mapper.config),
      );

    const requiredEntities = Object.keys(
      mappers.reduce((acc, mapper) => {
        for (const entity of mapper.getRequiredEntities()) {
          acc[entity] = true;
        }
        return acc;
      }, {}),
    );
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
      result[mapperCodes[i]] = mappers[i].map(items, params, meta);
    }
    return result;
  }

  private async getEntities(
    pipeline: Pipeline,
    entity: string,
    params: Record<string, any>,
  ) {
    const chunks = await Promise.all(
      pipeline.dataSources
        .filter(
          (dataSource) =>
            this.dataSourceService.getEntityByType(dataSource.type) === entity,
        )
        .map((dataSource) =>
          this.dataSourceService
            .instantiate(dataSource.type, dataSource.config)
            .getItems(params),
        ),
    );

    const mixer = this.mixerService.instantiate(
      entity,
      pipeline.mixers[entity],
    );

    let result = await mixer.mix(...chunks);

    const middlewares = pipeline.middlewares
      .filter(
        (middleware) =>
          this.middlewareService.getEntityByType(middleware.type) === entity,
      )
      .sort(({ order: orderA }, { order: orderB }) => orderB - orderA);
    for (const middleware of middlewares) {
      const instance = this.middlewareService.instantiate(
        middleware.type,
        middleware.config,
      );
      result = await instance.transform(result, params);
    }

    return result;
  }
}
