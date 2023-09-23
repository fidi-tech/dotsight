import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceService } from './data-source.service';
import { DebankWalletDatasource } from '../../collection/debank/wallet.datasource';
import { DataSource } from '../../entities/data-source.entity';
import { Repository } from 'typeorm';
import { TestDbModule } from '../../../common/spec/db';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let repository: Repository<DataSource>;

  beforeEach(async () => {
    repository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any as Repository<DataSource>;

    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDbModule, TypeOrmModule.forFeature([DataSource])],
      providers: [DataSourceService],
    })
      .overrideProvider(getRepositoryToken(DataSource))
      .useValue(repository)
      .compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('instantiate', () => {
    it('should throw if type if unknown', () => {
      expect(() => service.instantiate('random-type', {})).toThrow();
    });

    it('should return debank-wallet datasource', () => {
      const result = service.instantiate('debank-wallet', {
        key: 'some-key',
      });
      expect(result).toBeInstanceOf(DebankWalletDatasource);
    });
  });

  describe('create', () => {
    it('should throw if type does not match any data source', async () => {
      await expect(service.create('42', 'unknown-type', {})).rejects.toThrow();
    });

    it("should throw if data source's config validation fails", async () => {
      await expect(service.create('42', 'debank-wallet', {})).rejects.toThrow();
    });

    it('should create data source inn the repository', async () => {
      const dataSourceDraft = {
        'yet-another': 'data-source',
      } as any as DataSource;
      const dataSource = { hello: 'there' } as any as DataSource;
      (repository.create as jest.MockedFn<any>).mockImplementation(
        () => dataSourceDraft,
      );
      (repository.save as jest.MockedFn<any>).mockResolvedValue(dataSource);

      const result = await service.create('42', 'debank-wallet', {
        key: '123',
      });

      expect(repository.create).toHaveBeenCalledWith({
        pipeline: { id: '42' },
        type: 'debank-wallet',
        config: { key: '123' },
      });
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(dataSourceDraft);
      expect(result).toEqual(dataSource);
    });
  });
});
