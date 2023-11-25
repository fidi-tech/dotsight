import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Pipeline, PipelineId } from './entities/pipeline.entity';
import { ExecutePipelineDto } from './dto/execute-pipeline.dto';
import { ExecutePipelineService } from './services/execute-pipeline/execute-pipeline.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { PipelineService } from './services/pipeline/pipeline.service';
import {
  MapperService,
  MapperSuggestion,
} from '../mappers/services/mapper/mapper.service';
import { AddMapperDto } from './dto/add-mapper.dto';
import { AddWidgetDto } from './dto/add-widget.dto';
import { WidgetService } from '../widgets/services/widget/widget.service';
import { WidgetId } from '../widgets/entities/widget.entity';
import { DataSource as TypeOrmDataSource } from 'typeorm/data-source/DataSource';
import {
  DataSourceService,
  DatasourceSuggestion,
} from '../data-sources/services/data-source/data-source.service';
import { AddDataSourceDto } from './dto/add-data-source.dto';
import { PatchPipelineDto } from './dto/patch-pipeline.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';

class DatasourcesSuggestions {
  @ApiProperty({
    type: [DatasourceSuggestion],
  })
  entity: DatasourceSuggestion[];
}

@Controller('pipelines')
export class PipelinesController {
  constructor(
    private readonly executePipelineService: ExecutePipelineService,
    private readonly pipelineService: PipelineService,
    private readonly mapperService: MapperService,
    private readonly widgetService: WidgetService,
    private readonly dataSource: TypeOrmDataSource,
    private readonly dataSourceService: DataSourceService,
  ) {}

  @ApiOkResponse({
    description: "Pipeline's execution result is returned",
    schema: {
      type: 'object',
      description:
        'dictionary that maps widgetId or mapperCode to corresponding output',
      additionalProperties: {
        type: 'object',
        description: "mapper's output",
      },
    },
  })
  @Get('/:pipelineId/execute')
  async executePipeline(
    @Req() request,
    @Param('pipelineId') pipelineId: PipelineId,
    @Query() { mapperCodes, widgetIds, ...params }: ExecutePipelineDto,
  ): Promise<Record<string, any>> {
    const pipeline = await this.pipelineService.findById(
      request.userId,
      pipelineId,
    );

    const mapperCodeToWidgetId = {};
    if (widgetIds) {
      const widgets = (await this.widgetService.findByIds(widgetIds)).filter(
        (widget) => widget.mapper,
      );

      mapperCodes = [];
      for (const widget of widgets) {
        mapperCodes.push(widget.mapper.code);
        mapperCodeToWidgetId[widget.mapper.code] = widget.id;
      }
    }

    if (!mapperCodes || mapperCodes.length === 0) {
      throw new BadRequestException(
        `Either mapperCodes or widgetIds param should be specified`,
      );
    }

    const mapperResult = await this.executePipelineService.executePipeline(
      pipeline,
      mapperCodes,
      params,
    );

    if (widgetIds) {
      const widgetResult = {};
      for (const [mapperCode, res] of Object.entries(mapperResult)) {
        widgetResult[mapperCodeToWidgetId[mapperCode]] = res;
      }
      return widgetResult;
    }

    return mapperResult;
  }

  @ApiCreatedResponse({
    description: 'New pipeline is returned',
    type: Pipeline,
  })
  @Post('/')
  @UseGuards(JwtGuard)
  async createPipeline(
    @Req() request,
    @Body() { name = 'Untitled pipeline' }: CreatePipelineDto,
  ) {
    return this.pipelineService.create(request.userId, name);
  }

  @ApiOkResponse({
    description: 'All available pipelines are returned',
    type: [Pipeline],
  })
  @Get('/')
  @UseGuards(JwtGuard)
  async getPipelines(@Req() request) {
    return this.pipelineService.findAll(request.userId);
  }

  @ApiOkResponse({
    description: 'Pipeline by id is returned',
    type: Pipeline,
  })
  @Get('/:pipelineId')
  @UseGuards(JwtGuard)
  async getPipeline(
    @Req() request,
    @Param('pipelineId') pipelineId: PipelineId,
  ) {
    return this.pipelineService.findById(request.userId, pipelineId);
  }

  @ApiOkResponse({
    description:
      "Pipeline's fields get updated, and updated pipeline is returned",
    type: Pipeline,
  })
  @Patch('/:pipelineId')
  @UseGuards(JwtGuard)
  async patchPipeline(
    @Req() request,
    @Param('pipelineId') pipelineId: PipelineId,
    @Body() { name }: PatchPipelineDto,
  ) {
    const pipeline = await this.pipelineService.findById(
      request.userId,
      pipelineId,
    );
    await this.pipelineService.updatePipeline(pipeline, { name });
    return this.pipelineService.findById(request.userId, pipelineId);
  }

  @ApiCreatedResponse({
    description:
      'Adds new mapper to the pipeline, updated pipeline is returned',
    type: Pipeline,
  })
  @Post('/:pipelineId/mappers')
  @UseGuards(JwtGuard)
  async addMapper(
    @Req() request,
    @Param('pipelineId') pipelineId: PipelineId,
    @Body() { code, type, config }: AddMapperDto,
  ) {
    const pipeline = await this.pipelineService.findById(
      request.userId,
      pipelineId,
    );
    await this.mapperService.create(pipeline, code, type, config);
    return this.pipelineService.findById(request.userId, pipelineId);
  }

  @ApiCreatedResponse({
    description:
      'Adds new widget to the pipeline, updated pipeline is returned',
    type: Pipeline,
  })
  @Post('/:pipelineId/widgets')
  @UseGuards(JwtGuard)
  async addWidget(
    @Req() request,
    @Param('pipelineId') pipelineId: PipelineId,
    @Body() { type, config, datashape }: AddWidgetDto,
  ) {
    const pipeline = await this.pipelineService.findById(
      request.userId,
      pipelineId,
    );
    await this.widgetService.create(pipeline, type, config, datashape);
    return this.pipelineService.findById(request.userId, pipelineId);
  }

  @ApiOkResponse({
    description:
      'Calculates which mappers are compatible with the widget in context of the specified pipeline, and returns those',
    type: [MapperSuggestion],
  })
  @Get('/:pipelineId/widgets/:widgetId/suggestions/mappers')
  @UseGuards(JwtGuard)
  async getMappersByWidget(
    @Req() request,
    @Param('pipelineId') pipelineId: PipelineId,
    @Param('widgetId') widgetId: WidgetId,
  ) {
    // checking pipeline access
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const pipeline = await this.pipelineService.findById(
      request.userId,
      pipelineId,
    );
    const widget = await this.widgetService.findById(widgetId);
    return this.mapperService.queryAllByDatashape(widget.datashape);
  }

  @ApiOkResponse({
    description:
      'adds a new mapper to the pipeline, and binds it to the specified widget',
    type: Pipeline,
  })
  @Post('/:pipelineId/widgets/:widgetId/mappers')
  @UseGuards(JwtGuard)
  async addMapperAndBind(
    @Req() request,
    @Param('pipelineId') pipelineId: PipelineId,
    @Param('widgetId') widgetId: WidgetId,
    @Body() { code, type, config }: AddMapperDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const pipeline = await this.pipelineService.findById(
        request.userId,
        pipelineId,
      );
      await this.widgetService.addMapper(
        pipeline,
        widgetId,
        code,
        type,
        config,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return this.pipelineService.findById(request.userId, pipelineId);
  }

  @ApiOkResponse({
    description: 'returns suitable data sources',
    type: DatasourcesSuggestions,
  })
  @Get('/:pipelineId/suggestions/data-sources')
  @UseGuards(JwtGuard)
  async getSuggestedDatasources(
    @Req() request,
    @Param('pipelineId') pipelineId: PipelineId,
  ) {
    const pipeline = await this.pipelineService.findById(
      request.userId,
      pipelineId,
    );
    const entities = await this.pipelineService.getEntitiesByPipeline(pipeline);
    const result: Record<
      string,
      Array<{ type: string; configSchema: object }>
    > = {};
    for (const entity of entities) {
      result[entity] = this.dataSourceService.getDatasourcesByEntity(entity);
    }
    return result;
  }

  @ApiCreatedResponse({
    description: 'creates new data source, and returns updated pipeline',
    type: Pipeline,
  })
  @Post('/:pipelineId/data-sources')
  @UseGuards(JwtGuard)
  async addDataSource(
    @Req() request,
    @Param('pipelineId') pipelineId: PipelineId,
    @Body() { type, config }: AddDataSourceDto,
  ) {
    const pipeline = await this.pipelineService.findById(
      request.userId,
      pipelineId,
    );
    await this.dataSourceService.create(pipeline, type, config);
    return this.pipelineService.findById(request.userId, pipelineId);
  }
}
