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
import { PipelineAbilityService } from './services/pipeline-ability/pipeline-ability.service';
import { ForbiddenException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

describe('PipelinesController', () => {
  let controller: PipelinesController;
  let executeService: ExecutePipelineService;
  let pipelineService: PipelineService;
  let mapperService: MapperService;
  let widgetService: WidgetService;
  let pipelineAbilityService: PipelineAbilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        TypeOrmModule.forFeature([Pipeline, Mapper, DataSource, Widget]),
        JwtModule,
        ConfigModule,
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
        PipelineAbilityService,
      ],
    }).compile();

    controller = module.get<PipelinesController>(PipelinesController);
    executeService = module.get<ExecutePipelineService>(ExecutePipelineService);
    pipelineService = module.get<PipelineService>(PipelineService);
    mapperService = module.get<MapperService>(MapperService);
    widgetService = module.get<WidgetService>(WidgetService);
    pipelineAbilityService = module.get<PipelineAbilityService>(
      PipelineAbilityService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('executePipeline', () => {
    it('should throw ForbiddenException if claim failed', async () => {
      const userId = '13';
      const pipelineId = '1';
      const mapperCodes = ['10'];
      const params = { hello: 'there' };
      jest
        .spyOn(pipelineAbilityService, 'claimExecute')
        .mockImplementation(async () => {
          throw new ForbiddenException();
        });

      await expect(
        controller.executePipeline(userId, pipelineId, {
          mapperCodes,
          ...params,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should call executePipelineService.executePipeline and return it's result", async () => {
      const userId = '13';
      const mockedResult = 42;
      const pipelineId = '1';
      const mapperCodes = ['10'];
      const params = { hello: 'there' };

      jest.spyOn(pipelineAbilityService, 'claimExecute').mockResolvedValue();
      jest
        .spyOn(executeService, 'executePipeline')
        .mockResolvedValue(mockedResult);

      await expect(
        controller.executePipeline(userId, pipelineId, {
          mapperCodes,
          ...params,
        }),
      ).resolves.toEqual(mockedResult);
      expect(pipelineAbilityService.claimExecute).toHaveBeenCalledWith(
        userId,
        pipelineId,
      );
      expect(executeService.executePipeline).toHaveBeenCalledWith(
        pipelineId,
        mapperCodes,
        params,
      );
    });
  });

  describe('createPipeline', () => {
    it('should throw ForbiddenException if claim failed', async () => {
      const userId = '13';
      jest
        .spyOn(pipelineAbilityService, 'claimCreate')
        .mockImplementation(async () => {
          throw new ForbiddenException();
        });
      await expect(
        controller.createPipeline(userId, { name: '123' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should call pipelineService.create and return it's result", async () => {
      const userId = '13';
      const mockedResult = 42 as any as Pipeline;
      jest.spyOn(pipelineAbilityService, 'claimCreate').mockResolvedValue();
      jest.spyOn(pipelineService, 'create').mockResolvedValue(mockedResult);
      await expect(
        controller.createPipeline(userId, { name: '123' }),
      ).resolves.toEqual(mockedResult);
      expect(pipelineService.create).toHaveBeenCalledWith(userId, '123');
      expect(pipelineAbilityService.claimCreate).toHaveBeenCalledWith(userId);
    });
  });

  describe('getPipelines', () => {
    it("should call pipelineService.findAll and return it's result", async () => {
      const userId = '13';
      const mockedResult = 42 as any as Pipeline[];
      jest
        .spyOn(pipelineService, 'findAllByUserId')
        .mockResolvedValue(mockedResult);
      await expect(controller.getPipelines(userId)).resolves.toEqual(
        mockedResult,
      );
      expect(pipelineService.findAllByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('addMapper', () => {
    it('should throw ForbiddenException if claim failed', async () => {
      const userId = '13';
      jest
        .spyOn(pipelineAbilityService, 'claimModify')
        .mockImplementation(async () => {
          throw new ForbiddenException();
        });
      await expect(
        controller.addMapper(userId, '42', {
          code: 'code',
          type: 'type',
          config: { some: 'config' },
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create a mapper and return pipeline', async () => {
      const userId = '13';
      const pipeline = 42 as any as Pipeline;
      jest.spyOn(pipelineAbilityService, 'claimModify').mockResolvedValue();
      jest.spyOn(mapperService, 'create').mockResolvedValue(null);
      jest
        .spyOn(pipelineService, 'findByIdForUser')
        .mockResolvedValue(pipeline);

      await expect(
        controller.addMapper(userId, '42', {
          code: 'code',
          type: 'type',
          config: { some: 'config' },
        }),
      ).resolves.toEqual(pipeline);

      expect(mapperService.create).toHaveBeenCalledTimes(1);
      expect(mapperService.create).toHaveBeenCalledWith('42', 'code', 'type', {
        some: 'config',
      });
      expect(pipelineService.findByIdForUser).toHaveBeenCalledTimes(1);
      expect(pipelineService.findByIdForUser).toHaveBeenCalledWith(
        userId,
        '42',
      );
      expect(pipelineAbilityService.claimModify).toHaveBeenCalledWith(
        userId,
        '42',
      );
    });
  });

  describe('addWidget', () => {
    it('should throw ForbiddenException if claim failed', async () => {
      const userId = '13';
      jest
        .spyOn(pipelineAbilityService, 'claimModify')
        .mockImplementation(async () => {
          throw new ForbiddenException();
        });
      await expect(
        controller.addWidget(userId, '42', {
          type: 'type',
          config: { some: 'config' },
          datashape: 'some-dsh',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create a widget and return pipeline', async () => {
      const userId = '13';
      const pipeline = 42 as any as Pipeline;
      jest.spyOn(pipelineAbilityService, 'claimModify').mockResolvedValue();
      jest.spyOn(widgetService, 'create').mockResolvedValue(null);
      jest
        .spyOn(pipelineService, 'findByIdForUser')
        .mockResolvedValue(pipeline);

      await expect(
        controller.addWidget(userId, '42', {
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
      expect(pipelineService.findByIdForUser).toHaveBeenCalledTimes(1);
      expect(pipelineService.findByIdForUser).toHaveBeenCalledWith(
        userId,
        '42',
      );
      expect(pipelineAbilityService.claimModify).toHaveBeenCalledWith(
        userId,
        '42',
      );
    });
  });

  describe('getMappersByWidget', () => {
    it('should throw ForbiddenException if claim failed', async () => {
      const userId = '13';
      jest
        .spyOn(pipelineAbilityService, 'claimRead')
        .mockImplementation(async () => {
          throw new ForbiddenException();
        });
      await expect(
        controller.getMappersByWidget(userId, '42', 'wid'),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should return suggestions for widget's datashape", async () => {
      const userId = '13';
      const suggestions = 42 as any;
      jest.spyOn(pipelineAbilityService, 'claimRead').mockResolvedValue();
      jest
        .spyOn(widgetService, 'findById')
        .mockResolvedValue({ datashape: 'dsh' } as Widget);
      jest
        .spyOn(mapperService, 'queryAllByDatashape')
        .mockImplementation(() => suggestions);

      await expect(
        controller.getMappersByWidget(userId, '42', 'wid'),
      ).resolves.toEqual(suggestions);

      expect(widgetService.findById).toHaveBeenCalledTimes(1);
      expect(widgetService.findById).toHaveBeenCalledWith('wid');
      expect(mapperService.queryAllByDatashape).toHaveBeenCalledTimes(1);
      expect(mapperService.queryAllByDatashape).toHaveBeenCalledWith('dsh');
      expect(pipelineAbilityService.claimRead).toHaveBeenCalledWith(
        userId,
        '42',
      );
    });
  });

  describe('patchPipeline', () => {
    it('should throw ForbiddenException if claim failed', async () => {
      const userId = '13';
      jest
        .spyOn(pipelineAbilityService, 'claimModify')
        .mockImplementation(async () => {
          throw new ForbiddenException();
        });
      await expect(
        controller.patchPipeline(userId, '42', { name: 'new' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update pipeline and return updated version', async () => {
      const userId = '13';
      const result = 42 as any as Pipeline;
      jest.spyOn(pipelineAbilityService, 'claimModify').mockResolvedValue();
      jest
        .spyOn(pipelineService, 'updatePipeline')
        .mockImplementation(async () => {
          // do nothing
        });
      jest.spyOn(pipelineService, 'findByIdForUser').mockResolvedValue(result);

      await expect(
        controller.patchPipeline(userId, '42', { name: 'new', isPublic: true }),
      ).resolves.toEqual(result);

      expect(pipelineService.updatePipeline).toHaveBeenCalledTimes(1);
      expect(pipelineService.updatePipeline).toHaveBeenCalledWith('42', {
        name: 'new',
        isPublic: true,
      });
      expect(pipelineService.findByIdForUser).toHaveBeenCalledTimes(1);
      expect(pipelineService.findByIdForUser).toHaveBeenCalledWith(
        userId,
        '42',
      );
      expect(pipelineAbilityService.claimModify).toHaveBeenCalledWith(
        userId,
        '42',
      );
    });
  });
});
