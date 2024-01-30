import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Widget } from './entities/widget.entity';
import { WidgetService } from './services/widget/widget.service';
import { WidgetAbilityService } from './services/widget-ability/widget-ability.service';
import { WidgetsController } from './widgets.controller';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Widget]), CategoriesModule],
  controllers: [WidgetsController],
  providers: [WidgetService, WidgetAbilityService],
  exports: [WidgetService],
})
export class WidgetsModule {}
