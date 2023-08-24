import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from './pipeline.service';
import config from './pipelines.config';
import { NotFoundException } from '@nestjs/common';

describe('PipelineService', () => {
  let service: PipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipelineService],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return hardcoded pipeline', async () => {
    const pipelineConfig = config.pipelines[0];
    const pipeline = await service.findById(pipelineConfig.id);

    expect(pipeline).toBeDefined();
    expect(pipeline.id).toEqual(pipelineConfig.id);
    expect(Object.values(pipeline.mappers)).toHaveLength(1);
    expect(pipeline.mappers[pipelineConfig.mappers[0].id]).toBeDefined();
    expect(
      pipeline.mixers[Object.keys(pipelineConfig.mixers)[0]],
    ).toBeDefined();
    expect(
      pipeline.middlewares[Object.keys(pipelineConfig.middlewares)[0]],
    ).toHaveLength(
      pipelineConfig.middlewares[Object.keys(pipelineConfig.middlewares)[0]]
        .length,
    );
    expect(
      pipeline.dataSources[Object.keys(pipelineConfig.dataSources)[0]],
    ).toHaveLength(
      pipelineConfig.dataSources[Object.keys(pipelineConfig.dataSources)[0]]
        .length,
    );
  });

  it('should throw an error if pipeline was not found', async () => {
    await expect(service.findById('66')).rejects.toThrow(NotFoundException);
  });
});
