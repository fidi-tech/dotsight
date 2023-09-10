import { Test, TestingModule } from '@nestjs/testing';
import { MiddlewareService } from './middleware.service';
import { CoingeckoWalletTokenPriceMiddleware } from '../../collection/coingecko/wallet-token-price.middleware';

describe('MiddlewareService', () => {
  let service: MiddlewareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MiddlewareService],
    }).compile();

    service = module.get<MiddlewareService>(MiddlewareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if type if unknown', () => {
    expect(() => service.instantiate('random-type', {})).toThrow();
  });

  it('should return coingecko-wallet-token-price middleware', () => {
    const result = service.instantiate('coingecko-wallet-token-price', {
      key: 'some-key',
    });
    expect(result).toBeInstanceOf(CoingeckoWalletTokenPriceMiddleware);
  });
});
