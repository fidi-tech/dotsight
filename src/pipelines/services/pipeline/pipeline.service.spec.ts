import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from './pipeline.service';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Pipeline } from '../../entities/pipeline.entity';
import { Repository } from 'typeorm';
import { TestDbModule } from '../../../common/spec/db';
import { MapperService } from '../../../mappers/services/mapper/mapper.service';
import { MappersModule } from '../../../mappers/mappers.module';
import { AbstractMapper } from '../../../mappers/abstract.mapper';

describe('PipelineService', () => {
  let service: PipelineService;
  let repository: Repository<Pipeline>;
  let mapperService: MapperService;

  beforeEach(async () => {
    repository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    } as any as Repository<Pipeline>;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        TypeOrmModule.forFeature([Pipeline]),
        MappersModule,
      ],
      providers: [PipelineService],
    })
      .overrideProvider(getRepositoryToken(Pipeline))
      .useValue(repository)
      .compile();

    service = module.get<PipelineService>(PipelineService);
    mapperService = module.get<MapperService>(MapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should throw NotFoundException if pipeline was ot found', async () => {
      (repository.findOneBy as jest.MockedFn<any>).mockResolvedValue(null);

      await expect(service.findById('42')).rejects.toThrow(NotFoundException);
    });

    it('should return found pipeline', async () => {
      const pipeline = { hello: 'there' } as any as Pipeline;
      (repository.findOneBy as jest.MockedFn<any>).mockResolvedValue(pipeline);

      const result = await service.findById('42');

      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '42' });
      await expect(result).toEqual(pipeline);
    });
  });

  describe('create', () => {
    it('should create a pipeline in the repository', async () => {
      const pipelineDraft = { 'yet-another': 'pipeline' } as any as Pipeline;
      const pipeline = { hello: 'there' } as any as Pipeline;
      (repository.create as jest.MockedFn<any>).mockImplementation(
        () => pipelineDraft,
      );
      (repository.save as jest.MockedFn<any>).mockResolvedValue({
        id: 'new-id',
      });
      (repository.findOneBy as jest.MockedFn<any>).mockResolvedValue(pipeline);

      const result = await service.create('new name');

      expect(repository.create).toHaveBeenCalledWith({ name: 'new name' });
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(pipelineDraft);
      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'new-id' });
      expect(result).toEqual(pipeline);
    });
  });

  describe('findAll', () => {
    it('should return all the pipelines from the repository', async () => {
      const result = 42 as any as Pipeline[];
      (repository.find as jest.MockedFn<any>).mockResolvedValue(result);

      await expect(service.findAll()).resolves.toEqual(result);

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith();
    });
  });

  describe('getEntitiesByPipelineId', () => {
    it('should return all the entities required by the pipeline', async () => {
      const pipeline = {
        mappers: {
          1: { type: '11', config: '111' },
          2: { type: '22', config: '222' },
        },
      } as any as Pipeline;
      (repository.findOneBy as jest.MockedFn<any>).mockResolvedValue(pipeline);
      jest.spyOn(mapperService, 'instantiate').mockImplementation((type) => {
        if (type === '11') {
          return {
            getRequiredEntities: () => ['1', '2', '3'],
          } as any as AbstractMapper<any, any, any, any>;
        } else if (type == '22') {
          return {
            getRequiredEntities: () => ['2', '3', '4'],
          } as any as AbstractMapper<any, any, any, any>;
        }
      });

      await expect(service.getEntitiesByPipelineId('42')).resolves.toEqual([
        '1',
        '2',
        '3',
        '4',
      ]);
    });
  });

  describe('updatePipeline', () => {
    it('should throw NotFoundException if pipeline was not found', async () => {
      (repository.findOneBy as jest.MockedFn<any>).mockResolvedValue(null);

      await expect(
        service.updatePipeline('42', { name: 'new' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should save new name', async () => {
      const foundPipeline = { name: 'old', other: 'fields' } as any as Pipeline;
      const result = 66 as any as Pipeline;
      (repository.findOneBy as jest.MockedFn<any>)
        .mockResolvedValueOnce(foundPipeline)
        .mockResolvedValueOnce(result);
      (repository.save as jest.MockedFn<any>).mockResolvedValue(null);

      await service.updatePipeline('42', {
        name: 'new',
      });

      await expect(repository.findOneBy).toHaveBeenCalledTimes(1);
      await expect(repository.findOneBy).toHaveBeenCalledWith({ id: '42' });
      await expect(repository.save).toHaveBeenCalledTimes(1);
      await expect(repository.save).toHaveBeenCalledWith({
        ...foundPipeline,
        name: 'new',
      });
    });
  });
});
