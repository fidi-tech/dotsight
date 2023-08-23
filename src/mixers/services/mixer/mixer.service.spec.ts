import { Test, TestingModule } from '@nestjs/testing';
import { MixerService } from './mixer.service';

describe('MixerService', () => {
  let service: MixerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MixerService],
    }).compile();

    service = module.get<MixerService>(MixerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
