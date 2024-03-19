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
  AbstractDataSource,
  CommonParams,
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
    const subcategories = await this.categoriesService.findSubcategoriesByIds(
      widget.category,
      widget.subcategories,
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
    chunks: Array<{
      items: Array<Entity<any, any>>;
      meta: Meta;
      copyright: { id: string; name: string; icon: string | null };
    }>,
  ): {
    items: Array<
      Entity<any, any> & {
        copyrights: Record<
          string,
          { id: string; name: string; icon: string | null }
        >;
      }
    >;
    meta: Meta;
  } {
    const meta = {
      units: {},
    };
    const items: Record<
      EntityId,
      Entity<any, any> & {
        copyrights: Record<
          string,
          { id: string; name: string; icon: string | null }
        >;
      }
    > = {};
    for (const chunk of chunks) {
      Object.assign(meta.units, chunk.meta.units);
      for (const item of chunk.items) {
        if (!items[item.id]) {
          items[item.id] = {
            ...item,
            copyrights: { [chunk.copyright.id]: chunk.copyright },
          };
        } else {
          items[item.id].metrics = {
            ...items[item.id].metrics,
            ...item.metrics,
          };
          items[item.id].copyrights[chunk.copyright.id] = chunk.copyright;
        }
      }
    }
    return {
      items: Object.values(items),
      meta,
    };
  }

  private async getData(widget: Widget, params: CommonParams) {
    const datasources = await this.datasourceService.getDatasources(
      widget.category,
      widget.subcategories,
      widget.metrics,
      widget.preset,
    );

    const responses = await Promise.all(
      datasources.map(async (datasource) => {
        const items = await datasource.getItems({
          ...params,
          subcategories: widget.subcategories,
          metrics: widget.metrics,
          preset: widget.preset,
        });
        const copyright = datasource.getCopyright();
        return {
          items: items.items,
          meta: items.meta,
          copyright,
        };
      }),
    );

    return this.mixRawDatasourceResponse(responses);
  }

  private async executeMetricsWidget(widget: Widget, params: CommonParams) {
    const itemsPromise = this.getItems(widget);
    const metricsPromise = this.getMetrics(widget);

    const data = await this.getData(widget, params);

    const result: ExecuteWidgetDto['data'] = {
      items: [],
      metrics: widget.metrics,
      values: {},
      copyrights: {},
    };
    for (const item of data.items) {
      result.items.push(item.id);
      result.values[item.id] = {};
      result.copyrights[item.id] = item.copyrights;
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

  private async executePresetWidget(widget: Widget, params: CommonParams) {
    const data = await this.getData(widget, params);

    const items: ExecuteWidgetDto['items'] = {};
    const metrics: ExecuteWidgetDto['metrics'] = this.getPresetMetrics(widget);

    const result: ExecuteWidgetDto['data'] = {
      items: [],
      metrics: Object.keys(metrics),
      values: {},
      copyrights: {},
    };
    for (const item of data.items) {
      items[item.id] = {
        id: item.id,
        name: item.name,
        icon: item.icon,
      };
      result.items.push(item.id);
      result.values[item.id] = {};
      result.copyrights[item.id] = item.copyrights;
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
    params: CommonParams,
    qr?: QueryRunner,
  ): Promise<ExecuteWidgetDto> {
    const widget = await this.widgetService.findById(widgetId, null, qr);
    if (!this.canExecute(widget)) {
      throw new BadRequestException(`Widget ${widgetId} is not configured yet`);
    }

    if (widget.metrics && widget.metrics.length > 0) {
      return await this.executeMetricsWidget(widget, params);
    } else if (widget.preset) {
      return await this.executePresetWidget(widget, params);
    } else {
      // impossible, either metrics or preset are specified
    }
  }
}
