import { Controller, Get, Param, Query } from '@nestjs/common';
import { PipelineId } from './entities/pipeline.entity';
import { ExecutePipelineDto } from './dto/execute-pipeline.dto';
import { ExecutePipelineService } from './services/execute-pipeline/execute-pipeline.service';

@Controller('pipelines')
export class PipelinesController {
  constructor(
    private readonly executePipelineService: ExecutePipelineService,
  ) {}

  @Get('/:pipelineId/execute')
  async executePipeline(
    @Param('pipelineId') pipelineId: PipelineId,
    @Query() { mapperIds, ...params }: ExecutePipelineDto,
  ) {
    return this.executePipelineService.executePipeline(
      pipelineId,
      mapperIds,
      params,
    );
  }
}
