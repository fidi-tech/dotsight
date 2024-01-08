import { Test, TestingModule } from '@nestjs/testing';
import { ExecutePipelineService } from './execute-pipeline.service';
import { PipelineService } from '../pipeline/pipeline.service';
import { MapperService } from '../../../mappers/services/mapper/mapper.service';
import { DataSourceService } from '../../../data-sources/services/data-source/data-source.service';
import { MixerService } from '../../../mixers/services/mixer/mixer.service';
import { Pipeline } from '../../entities/pipeline.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AbstractMapper } from '../../../mappers/abstract.mapper';
import { AbstractDataSource } from '../../../data-sources/abstract.data-source';
import { AbstractMixer } from '../../../mixers/abstract.mixer';
import { MiddlewareService } from '../../../middlewares/services/middleware/middleware.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestDbModule } from '../../../common/spec/db';
import { Mapper } from '../../../mappers/entities/mapper.entity';
import { DataSource } from '../../../data-sources/entities/data-source.entity';
import {PipelineAbilityService} from '../pipeline-ability/pipeline-ability.service';

describe('ExecutePipelineService', () => {
  let service: ExecutePipelineService;
  let pipelineService: PipelineService;
  let mapperService: MapperService;
  let datasourceService: DataSourceService;
  let mixerService: MixerService;
  let middlewareService: MiddlewareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        TypeOrmModule.forFeature([Pipeline, Mapper, DataSource]),
      ],
      providers: [
        ExecutePipelineService,
        PipelineService,
        MapperService,
        DataSourceService,
        MixerService,
        MiddlewareService,
        PipelineAbilityService,
      ],
    }).compile();

    service = module.get<ExecutePipelineService>(ExecutePipelineService);
    pipelineService = module.get<PipelineService>(PipelineService);
    mapperService = module.get<MapperService>(MapperService);
    datasourceService = module.get<DataSourceService>(DataSourceService);
    mixerService = module.get<MixerService>(MixerService);
    middlewareService = module.get<MiddlewareService>(MiddlewareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executePipeline', () => {
    it('should throw error if pipeline does not exist', async () => {
      const error = new Error();
      jest.spyOn(pipelineService, 'findById').mockRejectedValue(error);
      await expect(
        service.executePipeline('id', ['mapperId'], {}),
      ).rejects.toThrow(error);
    });

    it('should throw an error if no mappers were passed', async () => {
      jest
        .spyOn(pipelineService, 'findById')
        .mockResolvedValue({} as any as Pipeline);

      await expect(service.executePipeline('id', [], {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if a non-existent mapper was specified', async () => {
      jest.spyOn(pipelineService, 'findById').mockResolvedValue({
        mappers: {
          '1': {},
          '2': {},
        },
      } as any as Pipeline);

      await expect(
        service.executePipeline('id', ['1', '3'], {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should correctly instantiate and use mappers', async () => {
      const params = { hello: 'there' };

      jest.spyOn(pipelineService, 'findById').mockResolvedValue({
        mappers: {
          '1': { type: 't1', config: { 1: 1 } },
          '2': { type: 't2', config: { 2: 2 } },
        },
      } as any as Pipeline);

      const mapperInstance1 = {
        getRequiredEntities: jest.fn(() => []),
        map: jest.fn(() => 13),
      };
      const mapperInstance2 = {
        getRequiredEntities: jest.fn(() => []),
        map: jest.fn(() => 101),
      };
      jest.spyOn(mapperService, 'instantiate').mockImplementation((type) => {
        if (type === 't1') {
          return mapperInstance1 as any as AbstractMapper<any, any, any, any>;
        } else if (type === 't2') {
          return mapperInstance2 as any as AbstractMapper<any, any, any, any>;
        }
      });

      await expect(
        service.executePipeline('id', ['1', '2'], params),
      ).resolves.toEqual({
        1: 13,
        2: 101,
      });
      expect(mapperService.instantiate).toHaveBeenCalledWith('t1', { 1: 1 });
      expect(mapperService.instantiate).toHaveBeenCalledWith('t2', { 2: 2 });
      expect(mapperInstance1.getRequiredEntities).toHaveBeenCalled();
      expect(mapperInstance2.getRequiredEntities).toHaveBeenCalled();
      expect(mapperInstance1.map).toHaveBeenCalledWith({}, params, {});
      expect(mapperInstance2.map).toHaveBeenCalledWith({}, params, {});
    });

    it("should throw if there is not datasource for mapper's required entity", async () => {
      jest.spyOn(pipelineService, 'findById').mockResolvedValue({
        dataSources: {
          e1: [
            { type: 'e1d1', config: { 11: 11 } },
            { type: 'e1d2', config: { 12: 12 } },
          ],
          e2: [{ type: 'e2d1', config: { 21: 21 } }],
        },
        mappers: {
          '1': { type: 't1', config: {} },
        },
      } as any as Pipeline);
      jest.spyOn(mapperService, 'instantiate').mockImplementation(() => {
        return {
          getRequiredEntities: () => ['e1', 'e2', 'e3'],
          map: (x) => x,
        } as any as AbstractMapper<any, any, any, any>;
      });

      await expect(
        service.executePipeline('id', ['1', '2'], {}),
      ).rejects.toThrow(); // 500 is okay for now
    });

    it('should correctly instantiate and use datasources & mixers', async () => {
      const params = { hello: 'there' };

      jest.spyOn(pipelineService, 'findById').mockResolvedValue({
        dataSources: [
          { type: 'e1d1', config: { 11: 11 } },
          { type: 'e1d2', config: { 12: 12 } },
          { type: 'e2d1', config: { 21: 21 } },
          { type: 'e3d1', config: { 31: 31 } },
          { type: 'e4d1', config: { 41: 41 } },
        ],
        mappers: {
          '1': { type: 't1', config: {} },
          '2': { type: 't2', config: {} },
        },
        middlewares: [],
        mixers: {
          e1: { e1: 'params' },
          e2: { e2: 'params' },
          e3: { e3: 'params' },
          e4: { e4: 'params' },
        },
      } as any as Pipeline);
      jest.spyOn(mapperService, 'instantiate').mockImplementation((type) => {
        if (type === 't1') {
          return {
            getRequiredEntities: () => ['e1', 'e2'],
            map: (x) => x,
          } as any as AbstractMapper<any, any, any, any>;
        } else if (type === 't2') {
          return {
            getRequiredEntities: () => ['e2', 'e3'],
            map: (x) => x,
          } as any as AbstractMapper<any, any, any, any>;
        }
      });
      const getItems = jest.fn(() => ({ items: [42], meta: { some: 'meta' } }));
      jest
        .spyOn(datasourceService, 'getEntityByType')
        .mockImplementation((type) => {
          switch (type) {
            case 'e1d1':
            case 'e1d2':
              return 'e1';
            case 'e2d1':
              return 'e2';
            case 'e3d1':
              return 'e3';
            case 'e4d1':
              return 'e4';
            default:
              throw Error('wrong mocks');
          }
        });
      jest
        .spyOn(datasourceService, 'instantiate')
        .mockImplementation(
          () => ({ getItems } as any as AbstractDataSource<any, any, any, any>),
        );
      const mix = jest.fn(async (...arr) => ({
        items: arr.reduce((acc, item) => [...acc, ...item.items], []),
        meta: { result: 'meta' },
      }));
      jest.spyOn(mixerService, 'instantiate').mockImplementation(
        () =>
          ({
            mix,
          } as any as AbstractMixer<any, any>),
      );

      await expect(
        service.executePipeline('id', ['1', '2'], params),
      ).resolves.toEqual({
        1: {
          e1: [42, 42],
          e2: [42],
          e3: [42],
        },
        2: {
          e1: [42, 42],
          e2: [42],
          e3: [42],
        },
      });

      expect(datasourceService.instantiate).toHaveBeenCalledTimes(4); // once for every required datasource, no instantiating for e4d1
      expect(datasourceService.instantiate).toHaveBeenCalledWith('e1d1', {
        11: 11,
      });
      expect(datasourceService.instantiate).toHaveBeenCalledWith('e1d2', {
        12: 12,
      });
      expect(datasourceService.instantiate).toHaveBeenCalledWith('e2d1', {
        21: 21,
      });
      expect(datasourceService.instantiate).toHaveBeenCalledWith('e3d1', {
        31: 31,
      });
      expect(datasourceService.instantiate).not.toHaveBeenCalledWith('e4d1', {
        41: 41,
      }); // e4d1 is not required for requested mappers
      expect(mixerService.instantiate).toHaveBeenCalledWith('e1', {
        e1: 'params',
      });
      expect(mixerService.instantiate).toHaveBeenCalledWith('e2', {
        e2: 'params',
      });
      expect(mixerService.instantiate).toHaveBeenCalledWith('e3', {
        e3: 'params',
      });
      expect(mixerService.instantiate).not.toHaveBeenCalledWith('e4', {
        e4: 'params',
      }); // entity e4 is not required for requested mappers
      expect(getItems).toHaveBeenCalledTimes(4); // once for every required datasource
      expect(getItems).toHaveBeenNthCalledWith(4, params); // each time with params
      expect(mix).toHaveBeenCalledTimes(3); // once for each entity e1,e2,e3
    });
  });

  describe('getParams', () => {
    it('should throw error if pipeline does not exist', async () => {
      const error = new Error();
      jest.spyOn(pipelineService, 'findById').mockRejectedValue(error);
      await expect(service.getParams('id', 'mapperId')).rejects.toThrow(error);
    });

    it('should throw an error if a non-existent mapper was specified', async () => {
      jest.spyOn(pipelineService, 'findById').mockResolvedValue({
        mappers: {
          '1': {},
          '2': {},
        },
      } as any as Pipeline);

      await expect(service.getParams('id', '3')).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should return merged params from all of the pipeline's components", async () => {
      jest.spyOn(pipelineService, 'findById').mockResolvedValue({
        dataSources: [
          { type: 'e1d1', config: { 11: 11 } },
          { type: 'e1d2', config: { 12: 12 } },
          { type: 'e2d1', config: { 21: 21 } },
        ],
        mappers: {
          '1': {
            type: 'mapper-type',
          },
        },
        middlewares: [{ type: 'some-middleware-type' }],
      } as any as Pipeline);
      jest.spyOn(mapperService, 'getParamsByType').mockImplementation(() => ({
        properties: {
          mapperProp1: 1,
          mapperProp2: 2,
          anotherProp: 3,
        },
        required: ['mapperProp1', 'anotherProp'],
      }));
      jest.spyOn(mapperService, 'instantiate').mockImplementation(
        () =>
          ({
            getRequiredEntities: () => ['e1', 'e2'],
            map: (x) => x,
          } as any as AbstractMapper<any, any, any, any>),
      );
      jest
        .spyOn(middlewareService, 'getEntityByType')
        .mockImplementation(() => 'e1');
      jest
        .spyOn(middlewareService, 'getParamsByType')
        .mockImplementation(() => ({
          properties: {
            middlewareProp1: 10,
            middlewareProp2: 11,
            anotherProp: 3,
          },
          required: ['middlewareProp1', 'anotherProp'],
        }));
      jest
        .spyOn(datasourceService, 'getEntityByType')
        .mockImplementation((type) => {
          switch (type) {
            case 'e1d1':
            case 'e1d2':
              return 'e1';
            case 'e2d1':
              return 'e2';
            default:
              throw Error('wrong mocks');
          }
        });
      jest
        .spyOn(datasourceService, 'getParamsByType')
        .mockImplementation((type) => {
          switch (type) {
            case 'e1d1':
              return {
                properties: {
                  dsProp1: 20,
                  dsProp2: 21,
                },
                required: ['dsProp1'],
              };
            case 'e1d2':
              return {
                properties: {
                  dsProp3: 22,
                  dsProp4: 23,
                },
                required: ['dsProp3'],
              };
            case 'e2d1':
              return {
                properties: {
                  dsProp5: 24,
                  dsProp6: 25,
                },
                required: ['dsProp5'],
              };
            default:
              throw Error('wrong mocks');
          }
        });

      await expect(service.getParams('42', '1')).resolves.toEqual({
        title: 'Params',
        type: 'object',
        description: 'Pipeline params',
        properties: {
          anotherProp: 3,
          dsProp1: 20,
          dsProp2: 21,
          dsProp3: 22,
          dsProp4: 23,
          dsProp5: 24,
          dsProp6: 25,
          mapperProp1: 1,
          mapperProp2: 2,
          middlewareProp1: 10,
          middlewareProp2: 11,
        },
        required: [
          'mapperProp1',
          'anotherProp',
          'middlewareProp1',
          'dsProp1',
          'dsProp3',
          'dsProp5',
        ],
      });
    });
  });
});
