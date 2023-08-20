import { Test, TestingModule } from '@nestjs/testing';
import { ExecutePipelineService } from './execute-pipeline.service';

describe('ExecutePipelineService', () => {
  let service: ExecutePipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutePipelineService],
    }).compile();

    service = module.get<ExecutePipelineService>(ExecutePipelineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
