import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Widget } from './entities/widget.entity';
import { WidgetService } from './services/widget/widget.service';
import { MappersModule } from '../mappers/mappers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Widget]), MappersModule],
  providers: [WidgetService],
  exports: [WidgetService],
})
export class WidgetsModule {}
