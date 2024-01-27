import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Widget } from './entities/widget.entity';
import { WidgetService } from './services/widget/widget.service';
import { MappersModule } from '../mappers/mappers.module';
import { WidgetAbilityService } from './services/widget-ability/widget-ability.service';
import { WidgetsController } from './widgets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Widget]), MappersModule],
  controllers: [WidgetsController],
  providers: [WidgetService, WidgetAbilityService],
  exports: [WidgetService],
})
export class WidgetsModule {}
