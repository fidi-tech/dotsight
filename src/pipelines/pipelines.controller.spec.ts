import { Test, TestingModule } from '@nestjs/testing';
import { PipelinesController } from './pipelines.controller';
import { ExecutePipelineService } from './services/execute-pipeline/execute-pipeline.service';
import { PipelineService } from './services/pipeline/pipeline.service';
import { MapperService } from '../mappers/services/mapper/mapper.service';
import { DataSourceService } from '../data-sources/services/data-source/data-source.service';
import { MixerService } from '../mixers/services/mixer/mixer.service';
import { MiddlewareService } from '../middlewares/services/middleware/middleware.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pipeline } from './entities/pipeline.entity';
import { TestDbModule } from '../common/spec/db';
import { Mapper } from '../mappers/entities/mapper.entity';
import { DataSource } from '../data-sources/entities/data-source.entity';
import { WidgetService } from '../widgets/services/widget/widget.service';
import { Widget } from '../widgets/entities/widget.entity';

describe('PipelinesController', () => {
  let controller: PipelinesController;
  let executeService: ExecutePipelineService;
  let pipelineService: PipelineService;
  let mapperService: MapperService;
  let widgetService: WidgetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        TypeOrmModule.forFeature([Pipeline, Mapper, DataSource, Widget]),
      ],
      controllers: [PipelinesController],
      providers: [
        ExecutePipelineService,
        PipelineService,
        MapperService,
        DataSourceService,
        MixerService,
        MiddlewareService,
        WidgetService,
      ],
    }).compile();

    controller = module.get<PipelinesController>(PipelinesController);
    executeService = module.get<ExecutePipelineService>(ExecutePipelineService);
    pipelineService = module.get<PipelineService>(PipelineService);
    mapperService = module.get<MapperService>(MapperService);
    widgetService = module.get<WidgetService>(WidgetService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('executePipeline', () => {
    it("should call executePipelineService.executePipeline and return it's result", async () => {
      const mockedResult = 42;
      const pipelineId = '1';
      const mapperCodes = ['10'];
      const params = { hello: 'there' };

      jest
        .spyOn(executeService, 'executePipeline')
        .mockResolvedValue(mockedResult);

      await expect(
        controller.executePipeline(pipelineId, { mapperCodes, ...params }),
      ).resolves.toEqual(mockedResult);
      expect(executeService.executePipeline).toHaveBeenCalledWith(
        pipelineId,
        mapperCodes,
        params,
      );
    });
  });

  describe('createPipeline', () => {
    it("should call pipelineService.create and return it's result", async () => {
      const mockedResult = 42 as any as Pipeline;
      jest.spyOn(pipelineService, 'create').mockResolvedValue(mockedResult);
      await expect(controller.createPipeline({ name: '123' })).resolves.toEqual(
        mockedResult,
      );
      expect(pipelineService.create).toHaveBeenCalledWith('123');
    });
  });

  describe('getPipelines', () => {
    it("should call pipelineService.findAll and return it's result", async () => {
      const mockedResult = 42 as any as Pipeline[];
      jest.spyOn(pipelineService, 'findAll').mockResolvedValue(mockedResult);
      await expect(controller.getPipelines()).resolves.toEqual(mockedResult);
      expect(pipelineService.findAll).toHaveBeenCalledWith();
    });
  });

  describe('addMapper', () => {
    it('should create a mapper and return pipeline', async () => {
      const pipeline = 42 as any as Pipeline;
      jest.spyOn(mapperService, 'create').mockResolvedValue(null);
      jest.spyOn(pipelineService, 'findById').mockResolvedValue(pipeline);

      await expect(
        controller.addMapper('42', {
          code: 'code',
          type: 'type',
          config: { some: 'config' },
        }),
      ).resolves.toEqual(pipeline);

      expect(mapperService.create).toHaveBeenCalledTimes(1);
      expect(mapperService.create).toHaveBeenCalledWith('42', 'code', 'type', {
        some: 'config',
      });
      expect(pipelineService.findById).toHaveBeenCalledTimes(1);
      expect(pipelineService.findById).toHaveBeenCalledWith('42');
    });
  });

  describe('addWidget', () => {
    it('should create a widget and return pipeline', async () => {
      const pipeline = 42 as any as Pipeline;
      jest.spyOn(widgetService, 'create').mockResolvedValue(null);
      jest.spyOn(pipelineService, 'findById').mockResolvedValue(pipeline);

      await expect(
        controller.addWidget('42', {
          type: 'type',
          config: { some: 'config' },
          datashape: 'some-dsh',
        }),
      ).resolves.toEqual(pipeline);

      expect(widgetService.create).toHaveBeenCalledTimes(1);
      expect(widgetService.create).toHaveBeenCalledWith(
        '42',
        'type',
        {
          some: 'config',
        },
        'some-dsh',
      );
      expect(pipelineService.findById).toHaveBeenCalledTimes(1);
      expect(pipelineService.findById).toHaveBeenCalledWith('42');
    });
  });

  describe('getMappersByWidget', () => {
    it("should return suggestions for widget's datashape", async () => {
      const suggestions = 42 as any;
      jest
        .spyOn(widgetService, 'findById')
        .mockResolvedValue({ datashape: 'dsh' } as Widget);
      jest
        .spyOn(mapperService, 'queryAllByDatashape')
        .mockImplementation(() => suggestions);

      await expect(controller.getMappersByWidget('42', 'wid')).resolves.toEqual(
        suggestions,
      );

      expect(widgetService.findById).toHaveBeenCalledTimes(1);
      expect(widgetService.findById).toHaveBeenCalledWith('wid');
      expect(mapperService.queryAllByDatashape).toHaveBeenCalledTimes(1);
      expect(mapperService.queryAllByDatashape).toHaveBeenCalledWith('dsh');
    });
  });

  describe('patchPipeline', () => {
    it('should update pipeline and return updated version', async () => {
      const result = 42 as any as Pipeline;
      jest
        .spyOn(pipelineService, 'updatePipeline')
        .mockImplementation(async () => {
          // do nothing
        });
      jest.spyOn(pipelineService, 'findById').mockResolvedValue(result);

      await expect(
        controller.patchPipeline('42', { name: 'new' }),
      ).resolves.toEqual(result);

      expect(pipelineService.updatePipeline).toHaveBeenCalledTimes(1);
      expect(pipelineService.updatePipeline).toHaveBeenCalledWith('42', {
        name: 'new',
      });
      expect(pipelineService.findById).toHaveBeenCalledTimes(1);
      expect(pipelineService.findById).toHaveBeenCalledWith('42');
    });
  });
});
