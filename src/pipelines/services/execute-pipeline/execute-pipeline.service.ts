import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PipelineService } from '../pipeline/pipeline.service';
import { Pipeline, PipelineId } from '../../entities/pipeline.entity';
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
    pipelineId: PipelineId,
    mapperCodes: MapperCode[],
    params: Record<string, any>,
  ) {
    if (mapperCodes.length === 0) {
      throw new BadRequestException(`No mapperIds specified`);
    }

    const pipeline = await this.pipelineService.findById(pipelineId);
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

  async getParams(pipelineId: PipelineId, code: MapperCode) {
    const pipeline = await this.pipelineService.findById(pipelineId);

    const result = {
      title: 'Params',
      description: 'Pipeline params',
      type: 'object',
      properties: {},
      required: [],
    };

    const mapper = pipeline.mappers[code];
    if (!mapper) {
      throw new NotFoundException(`Mapper "${code}" not found`);
    }
    // @ts-expect-error bad typings
    const mapperParams: { properties: object; required: string[] } =
      this.mapperService.getParamsByType(mapper.type);
    Object.assign(result.properties, mapperParams.properties);
    result.required = [
      ...new Set([...result.required, ...mapperParams.required]),
    ];

    const mapperInstance = this.mapperService.instantiate(
      mapper.type,
      mapper.config,
    );
    const entities = mapperInstance.getRequiredEntities();

    const middlewares = pipeline.middlewares.filter((middleware) =>
      entities.includes(
        this.middlewareService.getEntityByType(middleware.type),
      ),
    );
    for (const middleware of middlewares) {
      const params = this.middlewareService.getParamsByType(middleware.type);
      Object.assign(result.properties, params.properties);
      result.required = [...new Set([...result.required, ...params.required])];
    }

    const datasources = pipeline.dataSources.filter((dataSource) =>
      entities.includes(
        this.dataSourceService.getEntityByType(dataSource.type),
      ),
    );
    for (const datasource of datasources) {
      const params = this.dataSourceService.getParamsByType(datasource.type);
      Object.assign(result.properties, params.properties);
      result.required = [...new Set([...result.required, ...params.required])];
    }

    return result;
  }
}
