import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Widget } from './entities/widget.entity';
import { WidgetService } from './services/widget/widget.service';
import { WidgetAbilityService } from './services/widget-ability/widget-ability.service';
import { WidgetsController } from './widgets.controller';
import { CategoriesModule } from '../categories/categories.module';
import { DataSourcesModule } from '../data-sources/data-sources.module';
import { ExecuteWidgetService } from './services/widget/execute-widget.service';
import { TraceModule } from '../trace/trace.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Widget]),
    CategoriesModule,
    DataSourcesModule,
    TraceModule,
  ],
  controllers: [WidgetsController],
  providers: [WidgetService, WidgetAbilityService, ExecuteWidgetService],
  exports: [WidgetService],
})
export class WidgetsModule {}
