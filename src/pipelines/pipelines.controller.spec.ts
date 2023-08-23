import { Test, TestingModule } from '@nestjs/testing';
import { PipelinesController } from './pipelines.controller';
import { ExecutePipelineService } from './services/execute-pipeline/execute-pipeline.service';
import { PipelineService } from './services/pipeline/pipeline.service';
import { MapperService } from '../mappers/services/mapper/mapper.service';
import { DataSourceService } from '../data-sources/services/data-source/data-source.service';
import { MixerService } from '../mixers/services/mixer/mixer.service';

describe('PipelinesController', () => {
  let controller: PipelinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipelinesController],
      providers: [
        ExecutePipelineService,
        PipelineService,
        MapperService,
        DataSourceService,
        MixerService,
      ],
    }).compile();

    controller = module.get<PipelinesController>(PipelinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
