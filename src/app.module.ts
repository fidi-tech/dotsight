import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelinesModule } from './pipelines/pipelines.module';
import { config } from '../typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...config,
      migrations: [],
      synchronize: process.env.NODE_ENV === 'development',
    }),
    PipelinesModule,
  ],
})
export class AppModule {}
