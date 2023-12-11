import { Test, TestingModule } from '@nestjs/testing';
import { MapperService } from './mapper.service';
import { DistributionMapper } from '../../collection/distribution/distribution.mapper';
import { Repository } from 'typeorm';
import { Mapper } from '../../entities/mapper.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TestDbModule } from '../../../common/spec/db';
import { BadRequestException } from '@nestjs/common';

describe('MapperService', () => {
  let service: MapperService;
  let repository: Repository<Mapper>;

  beforeEach(async () => {
    repository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any as Repository<Mapper>;

    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDbModule, TypeOrmModule.forFeature([Mapper])],
      providers: [MapperService],
    })
      .overrideProvider(getRepositoryToken(Mapper))
      .useValue(repository)
      .compile();

    service = module.get<MapperService>(MapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('instantiate', () => {
    it('should throw if type if unknown', () => {
      expect(() => service.instantiate('random-type', {})).toThrow();
    });

    it('should return distribution mapper', () => {
      const result = service.instantiate('distribution', {
        nameField: 'symbol',
        valueField: 'amount',
        entity: 'walletToken',
      });
      expect(result).toBeInstanceOf(DistributionMapper);
    });
  });

  describe('queryByPipelineIdAndCode', () => {
    it('should return null if mapper was not found', async () => {
      (repository.findOneBy as jest.MockedFn<any>).mockResolvedValue(null);

      await expect(
        service.queryByPipelineIdAndCode('1', '42'),
      ).resolves.toEqual(null);
    });

    it('should return found mapper', async () => {
      const mapper = { hello: 'there' } as any as Mapper;
      (repository.findOneBy as jest.MockedFn<any>).mockResolvedValue(mapper);

      const result = await service.queryByPipelineIdAndCode('1', '66');

      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        pipeline: { id: '1' },
        code: '66',
      });
      await expect(result).toEqual(mapper);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if type does not match any mapper', async () => {
      await expect(
        service.create('42', 'some-code', 'type-404', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if mapper's config validation fails", async () => {
      await expect(
        service.create('42', 'some-code', DistributionMapper.getType(), {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if a mapper with the same code exists in the same pipeline', async () => {
      (repository.findOneBy as jest.MockedFn<any>).mockResolvedValue({
        some: 'mapper',
      });
      await expect(
        service.create('42', 'some-code', DistributionMapper.getType(), {
          nameField: 'symbol',
          valueField: 'amount',
          entity: 'walletToken',
        }),
      ).rejects.toThrow();
      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        pipeline: { id: '42' },
        code: 'some-code',
      });
    });

    it('should create a mapper in the repository', async () => {
      const mapperDraft = { 'yet-another': 'mapper' } as any as Mapper;
      const mapper = { hello: 'there' } as any as Mapper;
      (repository.create as jest.MockedFn<any>).mockImplementation(
        () => mapperDraft,
      );
      (repository.save as jest.MockedFn<any>).mockResolvedValue(mapper);

      const result = await service.create(
        '42',
        'some-code',
        DistributionMapper.getType(),
        {
          nameField: 'symbol',
          valueField: 'value',
          entity: 'walletToken',
        },
      );

      expect(repository.create).toHaveBeenCalledWith({
        pipeline: { id: '42' },
        code: 'some-code',
        type: DistributionMapper.getType(),
        config: {
          nameField: 'symbol',
          valueField: 'value',
          entity: 'walletToken',
        },
      });
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(mapperDraft);
      expect(result).toEqual(mapper);
    });
  });
});
