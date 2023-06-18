import { Module } from '@nestjs/common';
import { MapperService } from './services/mapper/mapper.service';

@Module({
  providers: [MapperService],
  exports: [MapperService],
})
export class MappersModule {}
