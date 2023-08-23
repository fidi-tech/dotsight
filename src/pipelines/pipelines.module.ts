import { Module } from '@nestjs/common';
import { PipelinesController } from './pipelines.controller';
import { ExecutePipelineService } from './services/execute-pipeline/execute-pipeline.service';
import { PipelineService } from './services/pipeline/pipeline.service';
import { MappersModule } from '../mappers/mappers.module';
import { DataSourcesModule } from '../data-sources/data-sources.module';
import { MixersModule } from '../mixers/mixers.module';

@Module({
  imports: [MappersModule, DataSourcesModule, MixersModule],
  controllers: [PipelinesController],
  providers: [ExecutePipelineService, PipelineService],
})
export class PipelinesModule {}