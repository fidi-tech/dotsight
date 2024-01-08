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
import { PipelineAbilityService } from '../pipeline-ability/pipeline-ability.service';

describe('PipelineService', () => {
  let service: PipelineService;
  let repository: Repository<Pipeline>;
  let mapperService: MapperService;
  let pipelineAbilityService: PipelineAbilityService;

  beforeEach(async () => {
    repository = {
      findOneBy: jest.fn(),
      findOne: jest.fn(),
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
      providers: [PipelineService, PipelineAbilityService],
    })
      .overrideProvider(getRepositoryToken(Pipeline))
      .useValue(repository)
      .compile();

    service = module.get<PipelineService>(PipelineService);
    mapperService = module.get<MapperService>(MapperService);
    pipelineAbilityService = module.get<PipelineAbilityService>(
      PipelineAbilityService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should throw NotFoundException if pipeline was ot found', async () => {
      (repository.findOne as jest.MockedFn<any>).mockResolvedValue(null);

      await expect(service.findById('42')).rejects.toThrow(NotFoundException);
    });

    it('should return found pipeline', async () => {
      const pipeline = { hello: 'there' } as any as Pipeline;
      (repository.findOne as jest.MockedFn<any>).mockResolvedValue(pipeline);

      const result = await service.findById('42');

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '42' },
        relations: ['createdBy'],
      });
      await expect(result).toEqual(pipeline);
    });
  });

  describe('findByIdForUser', () => {
    it('should return enriched result from findById', async () => {
      const pipeline = { hello: 'there', id: '42' } as any as Pipeline;
      (repository.findOne as jest.MockedFn<any>).mockResolvedValue(pipeline);
      jest
        .spyOn(pipelineAbilityService, 'addAbilities')
        .mockImplementation((userId, pipeline) => {
          // @ts-expect-error for unit test
          pipeline.withAbilities = pipeline.id + userId;
        });

      await expect(service.findByIdForUser('13', '42')).resolves.toEqual({
        ...pipeline,
        withAbilities: '4213',
      });

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '42' },
        relations: ['createdBy'],
      });
      expect(pipelineAbilityService.addAbilities).toHaveBeenCalledTimes(1);
      expect(pipelineAbilityService.addAbilities).toHaveBeenCalledWith(
        '13',
        expect.objectContaining(pipeline),
      );
    });
  });

  describe('create', () => {
    it('should create a pipeline in the repository', async () => {
      const userId = '13';
      const pipelineDraft = { 'yet-another': 'pipeline' } as any as Pipeline;
      const pipeline = { hello: 'there' } as any as Pipeline;
      (repository.create as jest.MockedFn<any>).mockImplementation(
        () => pipelineDraft,
      );
      (repository.save as jest.MockedFn<any>).mockResolvedValue({
        id: 'new-id',
      });
      (repository.findOne as jest.MockedFn<any>).mockResolvedValue(pipeline);
      jest
        .spyOn(pipelineAbilityService, 'addAbilities')
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .mockImplementation(() => {});

      const result = await service.create(userId, 'new name');

      expect(repository.create).toHaveBeenCalledWith({
        name: 'new name',
        createdBy: { id: userId },
      });
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(pipelineDraft);
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'new-id' },
        relations: ['createdBy'],
      });
      expect(result).toEqual(pipeline);
    });
  });

  describe('findAllByUserId', () => {
    it('should return all the pipelines from the repository', async () => {
      const userId = '13';
      (repository.find as jest.MockedFn<any>).mockResolvedValue([
        { id: 42 },
        { id: 66 },
      ] as any as Pipeline[]);
      jest
        .spyOn(pipelineAbilityService, 'addAbilities')
        .mockImplementation((userId, pipeline) => {
          // @ts-expect-error for unit test
          pipeline.withAbilities = pipeline.id + userId;
        });

      await expect(service.findAllByUserId(userId)).resolves.toEqual([
        { id: 42, withAbilities: '4213' },
        { id: 66, withAbilities: '6613' },
      ]);

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { createdBy: { id: userId } },
        relations: ['createdBy'],
      });
      expect(pipelineAbilityService.addAbilities).toHaveBeenCalledTimes(2);
      expect(pipelineAbilityService.addAbilities).toHaveBeenNthCalledWith(
        1,
        userId,
        expect.objectContaining({ id: 42 }),
      );
      expect(pipelineAbilityService.addAbilities).toHaveBeenNthCalledWith(
        2,
        userId,
        expect.objectContaining({ id: 66 }),
      );
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
      (repository.findOne as jest.MockedFn<any>).mockResolvedValue(pipeline);
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

    it('should save new name and isPublic', async () => {
      const foundPipeline = {
        name: 'old',
        isPublic: false,
        other: 'fields',
      } as any as Pipeline;
      const result = 66 as any as Pipeline;
      (repository.findOne as jest.MockedFn<any>)
        .mockResolvedValueOnce(foundPipeline)
        .mockResolvedValueOnce(result);
      (repository.save as jest.MockedFn<any>).mockResolvedValue(null);

      await service.updatePipeline('42', {
        name: 'new',
        isPublic: true,
      });

      await expect(repository.findOne).toHaveBeenCalledTimes(1);
      await expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '42' },
        relations: ['createdBy'],
      });
      await expect(repository.save).toHaveBeenCalledTimes(1);
      await expect(repository.save).toHaveBeenCalledWith({
        ...foundPipeline,
        name: 'new',
        isPublic: true,
      });
    });
  });
});
