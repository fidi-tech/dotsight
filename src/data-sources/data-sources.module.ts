import { Module } from '@nestjs/common';
import { CsvModule } from 'nest-csv-parser';
import { DataSourceService } from './services/data-source/data-source.service';

@Module({
  imports: [CsvModule],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourcesModule {}
