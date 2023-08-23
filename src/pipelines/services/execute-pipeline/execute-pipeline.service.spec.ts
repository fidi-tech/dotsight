import { Test, TestingModule } from '@nestjs/testing';
import { ExecutePipelineService } from './execute-pipeline.service';
import { PipelineService } from '../pipeline/pipeline.service';
import { MapperService } from '../../../mappers/services/mapper/mapper.service';
import { DataSourceService } from '../../../data-sources/services/data-source/data-source.service';
import { MixerService } from '../../../mixers/services/mixer/mixer.service';

describe('ExecutePipelineService', () => {
  let service: ExecutePipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutePipelineService,
        PipelineService,
        MapperService,
        DataSourceService,
        MixerService,
      ],
    }).compile();

    service = module.get<ExecutePipelineService>(ExecutePipelineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
