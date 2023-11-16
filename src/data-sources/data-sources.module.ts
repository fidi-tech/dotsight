import { Module } from '@nestjs/common';
import { DataSourceService } from './services/data-source/data-source.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from './entities/data-source.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataSource])],
  providers: [DataSourceService],
  exports: [DataSourceService],
})
export class DataSourcesModule {}
