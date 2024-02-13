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
import {
  Entity,
  EntityId,
  Meta,
} from '../../../data-sources/abstract.data-source';

@Injectable()
export class ExecuteWidgetService {
  constructor(
    private readonly widgetService: WidgetService,
    private readonly categoriesService: CategoriesService,
    private readonly datasourceService: DataSourceService,
  ) {}

  private canExecute(widget: Widget) {
    return (
      widget.subcategories.length > 0 &&
      ((widget.metrics && widget.metrics.length > 0) || widget.preset)
    );
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
    chunks: Array<{ items: Array<Entity<any, any>>; meta: Meta }>,
  ): { items: Array<Entity<any, any>>; meta: Meta } {
    const meta = {
      units: {},
    };
    const items: Record<EntityId, Entity<any, any>> = {};
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

  private async getData(widget: Widget) {
    const datasources = await this.datasourceService.getDatasources(
      widget.category,
      widget.subcategories,
      widget.metrics,
      widget.preset,
    );

    const responses = await Promise.all(
      datasources.map((datasource) =>
        datasource.getItems({
          subcategories: widget.subcategories,
          metrics: widget.metrics,
          preset: widget.preset,
        }),
      ),
    );

    return this.mixRawDatasourceResponse(responses);
  }

  private async executeMetricsWidget(widget: Widget) {
    const itemsPromise = this.getItems(widget);
    const metricsPromise = this.getMetrics(widget);

    const data = await this.getData(widget);

    const result: ExecuteWidgetDto['data'] = {
      items: [],
      metrics: widget.metrics,
      values: {},
    };
    for (const item of data.items) {
      result.items.push(item.id);
      result.values[item.id] = {};
      for (const metric of widget.metrics) {
        result.values[item.id][metric] = item.metrics[metric];
      }
    }

    return {
      items: await itemsPromise,
      metrics: await metricsPromise,
      units: data.meta.units,
      data: result,
    };
  }

  private getPresetMetrics(widget: Widget) {
    const category = this.categoriesService.findCategory(widget.category);
    return category.getMetricsByPreset(widget.preset);
  }

  private async executePresetWidget(widget: Widget) {
    const data = await this.getData(widget);

    const items: ExecuteWidgetDto['items'] = {};
    const metrics: ExecuteWidgetDto['metrics'] = this.getPresetMetrics(widget);

    const result: ExecuteWidgetDto['data'] = {
      items: [],
      metrics: Object.keys(metrics),
      values: {},
    };
    for (const item of data.items) {
      items[item.id] = {
        id: item.id,
        name: item.name,
        icon: item.icon,
      };
      result.items.push(item.id);
      result.values[item.id] = {};
      for (const metric of Object.keys(metrics)) {
        result.values[item.id][metric] = item.metrics[metric];
      }
    }

    return {
      items,
      metrics,
      units: data.meta.units,
      data: result,
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

    if (widget.metrics && widget.metrics.length > 0) {
      return await this.executeMetricsWidget(widget);
    } else if (widget.preset) {
      return await this.executePresetWidget(widget);
    } else {
      // impossible, either metrics or preset are specified
    }
  }
}
