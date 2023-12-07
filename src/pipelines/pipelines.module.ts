import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelinesController } from './pipelines.controller';
import { ExecutePipelineService } from './services/execute-pipeline/execute-pipeline.service';
import { PipelineService } from './services/pipeline/pipeline.service';
import { MappersModule } from '../mappers/mappers.module';
import { DataSourcesModule } from '../data-sources/data-sources.module';
import { MixersModule } from '../mixers/mixers.module';
import { MiddlewaresModule } from '../middlewares/middlewares.module';
import { Pipeline } from './entities/pipeline.entity';
import { WidgetsModule } from '../widgets/widgets.module';
import { PipelineAbilityService } from './services/pipeline-ability/pipeline-ability.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pipeline]),
    MappersModule,
    DataSourcesModule,
    MixersModule,
    MiddlewaresModule,
    WidgetsModule,
  ],
  controllers: [PipelinesController],
  providers: [ExecutePipelineService, PipelineService, PipelineAbilityService],
})
export class PipelinesModule {}
