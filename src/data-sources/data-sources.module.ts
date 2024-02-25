import { Module } from '@nestjs/common';
import { DataSourceService } from './services/data-source/data-source.service';

@Module({
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourcesModule {}
