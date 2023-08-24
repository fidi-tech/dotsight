import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceService } from './data-source.service';
import { DebankWalletDatasource } from '../../collection/debank/wallet.datasource';

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataSourceService],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

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
