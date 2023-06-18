import { Test, TestingModule } from '@nestjs/testing';
import { MapperService } from './mapper.service';
import { DistributionMapper } from '../../collection/distribution/distribution.mapper';

describe('MapperService', () => {
  let service: MapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MapperService],
    }).compile();

    service = module.get<MapperService>(MapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if type if unknown', () => {
    expect(() => service.instantiate('random-type', {})).toThrow();
  });

  it('should return distribution mapper', () => {
    const result = service.instantiate('distribution', {
      nameField: 'name',
      valueField: 'value',
      entity: 'wallet',
    });
    expect(result).toBeInstanceOf(DistributionMapper);
  });
});
