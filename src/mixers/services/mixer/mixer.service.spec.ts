import { Test, TestingModule } from '@nestjs/testing';
import { MixerService } from './mixer.service';
import { AbstractMixer } from '../../abstract.mixer';

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

  it('should instantiate abstract mixer with given params', () => {
    const params = { "they're taking the hobbits": 'to isengard' };
    const mixer = service.instantiate('any', params);

    expect(mixer).toBeInstanceOf(AbstractMixer);
    expect((mixer as any).config).toEqual(params);
  });
});
