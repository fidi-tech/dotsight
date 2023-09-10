import { Test, TestingModule } from '@nestjs/testing';
import { PipelinesController } from './pipelines.controller';
import { ExecutePipelineService } from './services/execute-pipeline/execute-pipeline.service';
import { PipelineService } from './services/pipeline/pipeline.service';
import { MapperService } from '../mappers/services/mapper/mapper.service';
import { DataSourceService } from '../data-sources/services/data-source/data-source.service';
import { MixerService } from '../mixers/services/mixer/mixer.service';
import { MiddlewareService } from '../middlewares/services/middleware/middleware.service';

describe('PipelinesController', () => {
  let controller: PipelinesController;
  let service: ExecutePipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipelinesController],
      providers: [
        ExecutePipelineService,
        PipelineService,
        MapperService,
        DataSourceService,
        MixerService,
        MiddlewareService,
      ],
    }).compile();

    controller = module.get<PipelinesController>(PipelinesController);
    service = module.get<ExecutePipelineService>(ExecutePipelineService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call executePipelineService.executePipeline on executePipeline', () => {
    const mockedResult = 42;
    const pipelineId = '1';
    const mapperIds = ['10'];
    const params = { hello: 'there' };

    jest.spyOn(service, 'executePipeline').mockResolvedValue(mockedResult);

    expect(
      controller.executePipeline(pipelineId, { mapperIds, ...params }),
    ).resolves.toEqual(mockedResult);
    expect(service.executePipeline).toHaveBeenCalledWith(
      pipelineId,
      mapperIds,
      params,
    );
  });
});
