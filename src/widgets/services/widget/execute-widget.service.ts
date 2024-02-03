import { BadRequestException, Injectable } from '@nestjs/common';
import { Widget, WidgetId } from '../../entities/widget.entity';
import { UserId } from '../../../users/entities/user.entity';
import { QueryRunner } from 'typeorm';
import { ExecuteWidgetDto } from '../../dto/execute-widget.dto';
import { WidgetService } from './widget.service';
import {
  Metric,
  MetricId,
  Subcategory,
  SubcategoryId,
} from '../../../common/categories/abstract.category';
import { CategoriesService } from '../../../categories/services/categories.service';
import { DataSourceService } from '../../../data-sources/services/data-source/data-source.service';
import { Entity, EntityId } from '../../../entities/entity';
import { Meta } from '../../../data-sources/abstract.data-source';

@Injectable()
export class ExecuteWidgetService {
  constructor(
    private readonly widgetService: WidgetService,
    private readonly categoriesService: CategoriesService,
    private readonly datasourceService: DataSourceService,
  ) {}

  private canExecute(widget: Widget) {
    return widget.subcategories.length > 0 && widget.metrics.length > 0;
  }

  private async getItems(widget: Widget) {
    const subcategories = await this.categoriesService.findSubcategories(
      widget.category,
    );
    return subcategories.reduce((acc, subcategory) => {
      acc[subcategory.id] = subcategory;
      return acc;
    }, {} as Record<SubcategoryId, Subcategory>);
  }

  private async getMetrics(widget: Widget) {
    const metrics = await this.categoriesService.findMetrics(widget.category);
    return metrics.reduce((acc, metric) => {
      acc[metric.id] = metric;
      return acc;
    }, {} as Record<MetricId, Metric>);
  }

  private mixRawDatasourceResponse(
    chunks: Array<{ items: Array<Entity<any, any, any>>; meta: Meta }>,
  ): { items: Array<Entity<any, any, any>>; meta: Meta } {
    const meta = {
      units: {},
    };
    const items: Record<EntityId, Entity<any, any, any>> = {};
    for (const chunk of chunks) {
      Object.assign(meta.units, chunk.meta.units);
      for (const item of chunk.items) {
        items[item.id] = item;
      }
    }
    return {
      items: Object.values(items),
      meta,
    };
  }

  async executeWidget(
    userId: UserId,
    widgetId: WidgetId,
    qr?: QueryRunner,
  ): Promise<ExecuteWidgetDto> {
    const widget = await this.widgetService.findById(widgetId, null, qr);
    if (!this.canExecute(widget)) {
      throw new BadRequestException(`Widget ${widgetId} is not configured yet`);
    }
    const itemsPromise = this.getItems(widget);
    const metricsPromise = this.getMetrics(widget);

    const datasources = await this.datasourceService.getDatasources(
      widget.category,
      widget.subcategories,
      widget.metrics,
    );
    // TODO make common_params runtime
    // TODO declare global common params type
    const COMMON_PARAMS = {};
    const raw = await Promise.all(
      datasources.map((datasource) => datasource.getItems(COMMON_PARAMS)),
    );
    const prepared = this.mixRawDatasourceResponse(raw);
    const data: ExecuteWidgetDto['data'] = {
      items: [],
      metrics: widget.metrics,
      values: {},
    };
    for (const item of prepared.items) {
      data.items.push(item.id);
      data.values[item.id] = {};
      for (const metric of widget.metrics) {
        data.values[item.id][metric] = item.historicalMetrics[metric];
      }
    }

    return {
      items: await itemsPromise,
      metrics: await metricsPromise,
      units: prepared.meta.units,
      data,
    };
  }
}
