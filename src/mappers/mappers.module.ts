import { Module } from '@nestjs/common';
import { MapperService } from './services/mapper/mapper.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mapper } from './entities/mapper.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mapper])],
  providers: [MapperService],
  exports: [MapperService],
})
export class MappersModule {}
