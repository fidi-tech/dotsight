import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, QueryRunner, Repository } from 'typeorm';
import { Widget, WidgetId } from '../../entities/widget.entity';
import { UserId } from '../../../users/entities/user.entity';
import { WidgetAbilityService } from '../widget-ability/widget-ability.service';
import {
  CategoryId,
  MetricId,
  PresetId,
  Subcategory,
  SubcategoryId,
} from '../../../common/categories/abstract.category';
import { CategoriesService } from '../../../categories/services/categories.service';
import { SubcategoryDto } from '../../dto/subcategory.dto';
import { MetricDto } from '../../dto/metric.dto';
import { DataSourceService } from '../../../data-sources/services/data-source/data-source.service';

@Injectable()
export class WidgetService {
  constructor(
    @InjectRepository(Widget)
    private readonly widgetRepository: Repository<Widget>,
    private readonly widgetAbilityService: WidgetAbilityService,
    private readonly categoriesService: CategoriesService,
    private readonly datasourceService: DataSourceService,
    private dataSource: DataSource,
  ) {}

  private getWidgetRepository(qr?: QueryRunner) {
    if (qr) {
      return qr.connection.getRepository(Widget);
    }
    return this.widgetRepository;
  }

  async queryWidgets(
    userId: UserId,
    limit: number,
    offset: number,
    query?: string,
    qr?: QueryRunner,
  ) {
    const widgets = await this.getWidgetRepository(qr).find({
      where: { createdBy: { id: userId }, name: query && Like(`%${query}%`) },
      relations: ['createdBy'],
      order: {
        createdAt: 'DESC',
      },
    });
    for (const widget of widgets) {
      this.widgetAbilityService.addAbilities(userId, widget);
    }
    return widgets;
  }

  async findById(widgetId: WidgetId, userId?: UserId, qr?: QueryRunner) {
    const widget = await this.getWidgetRepository(qr).findOne({
      where: { id: widgetId },
      relations: ['createdBy'],
    });
    if (userId) {
      this.widgetAbilityService.addAbilities(userId, widget);
    }
    return widget;
  }

  async create(
    userId: UserId,
    category: CategoryId,
    name = 'Untitled widget',
    qr?: QueryRunner,
  ) {
    const widget = await this.getWidgetRepository(qr).create({
      category,
      name,
      createdBy: { id: userId },
    });
    await this.getWidgetRepository(qr).save(widget);
    this.widgetAbilityService.addAbilities(userId, widget);
    return widget;
  }

  async deleteWidget(widgetId: WidgetId) {
    await this.getWidgetRepository().delete({ id: widgetId });
  }

  async save(
    userId: UserId,
    widgetId: WidgetId,
    name?: string,
    isPublic?: boolean,
    view?: string,
    viewParameters?: object,
    qr?: QueryRunner,
  ) {
    const widget = await this.findById(widgetId, undefined, qr);
    if (name) {
      widget.name = name;
    }
    if (isPublic !== undefined) {
      widget.isPublic = isPublic;
    }
    if (view) {
      widget.view = view;
    }
    if (viewParameters) {
      widget.viewParameters = viewParameters;
    }
    await this.getWidgetRepository(qr).save(widget);
    return widget;
  }

  async querySubcategories(
    userId: UserId,
    widgetId: WidgetId,
    query?: string,
    qr?: QueryRunner,
  ): Promise<SubcategoryDto[]> {
    const widget = await this.findById(widgetId, null, qr);
    if (!widget.category) {
      return [];
    }
    const [subcategoriesByQuery, selectedSubcategroies] = await Promise.all([
      this.categoriesService.findSubcategories(widget.category, query),
      this.categoriesService.findSubcategoriesByIds(
        widget.category,
        widget.subcategories || [],
      ),
    ]);

    const subcategories: Record<SubcategoryId, Subcategory> = {};
    for (const subcategory of [
      ...selectedSubcategroies,
      ...subcategoriesByQuery,
    ]) {
      subcategories[subcategory.id] = subcategory;
    }

    return Object.values(subcategories)
      .sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
      .map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.name,
        icon: subcategory.icon,
        isAvailable: true,
        isSelected: widget.subcategories.includes(subcategory.id),
      }));
  }

  async setSubcategories(
    userId: UserId,
    widgetId: WidgetId,
    subcategories: SubcategoryId[],
    qr?: QueryRunner,
  ) {
    if (!qr) {
      const qr = this.dataSource.createQueryRunner();
      await qr.connect();
      await qr.startTransaction();
      try {
        return await this.setSubcategories(userId, widgetId, subcategories, qr);
      } catch (err) {
        await qr.rollbackTransaction();
        throw err;
      } finally {
        // you need to release a queryRunner which was manually instantiated
        await qr.release();
      }
    }

    const widget = await this.findById(widgetId, null, qr);
    const foundSubcategories =
      await this.categoriesService.findSubcategoriesByIds(
        widget.category,
        subcategories,
      );
    const miss = subcategories.find(
      (subcategoryId) =>
        !foundSubcategories.find((found) => found.id === subcategoryId),
    );
    if (miss) {
      throw new BadRequestException(`Subcategory ${miss} is not found`);
    }
    widget.subcategories = [...new Set(subcategories)];
    return await this.getWidgetRepository(qr).save(widget);
  }

  async setMetrics(
    userId: UserId,
    widgetId: WidgetId,
    metrics?: MetricId[],
    preset?: PresetId,
    qr?: QueryRunner,
  ) {
    if ((metrics && preset) || (!metrics && !preset)) {
      throw new BadRequestException(
        'You should specify exactly one of [metrics,preset]',
      );
    }

    if (!qr) {
      const qr = this.dataSource.createQueryRunner();
      await qr.connect();
      await qr.startTransaction();
      try {
        return await this.setMetrics(userId, widgetId, metrics, preset, qr);
      } catch (err) {
        await qr.rollbackTransaction();
        throw err;
      } finally {
        // you need to release a queryRunner which was manually instantiated
        await qr.release();
      }
    }

    const [widget, suggested] = await Promise.all([
      this.findById(widgetId, null, qr),
      this.queryMetrics(userId, widgetId, undefined, qr),
    ]);
    if (preset) {
      const presetExists = suggested.presets.find(
        (suggested) => suggested.id === preset,
      );
      if (!presetExists) {
        throw new BadRequestException(`Preset ${preset} is not found`);
      }
      widget.preset = preset;
      widget.metrics = null;
    } else if (metrics) {
      const miss = metrics.find(
        (metricId) =>
          !suggested.metrics.find(
            (suggest) => suggest.id === metricId && suggest.isAvailable,
          ),
      );
      if (miss) {
        throw new BadRequestException(`Metric ${miss} is not found`);
      }
      widget.metrics = [...new Set(metrics)];
      widget.preset = null;
    } else {
      // not reachable, exactly one should be specified
    }

    return await this.getWidgetRepository(qr).save(widget);
  }

  async queryMetrics(
    userId: UserId,
    widgetId: WidgetId,
    query?: string,
    qr?: QueryRunner,
  ): Promise<{ metrics: MetricDto[]; presets: MetricDto[] }> {
    const widget = await this.findById(widgetId, null, qr);
    if (!widget.category) {
      return { metrics: [], presets: [] };
    }

    const [metrics, presets] = await Promise.all([
      this.categoriesService
        .findMetrics(widget.category, query)
        .then(async (metrics) => {
          const metricIds = await this.datasourceService.getSupportedMetrics(
            widget.category,
            widget.subcategories,
            metrics.map((metric) => metric.id),
          );
          return metrics.filter(({ id }) => metricIds.includes(id));
        }),
      this.categoriesService
        .findPresets(widget.category, query)
        .then(async (presets) => {
          const presetIds = await this.datasourceService.getSupportedPresets(
            widget.category,
            widget.subcategories,
            presets.map((preset) => preset.id),
          );
          return presets.filter(({ id }) => presetIds.includes(id));
        }),
    ]);

    return {
      metrics: metrics
        .sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
        .map((metric) => ({
          id: metric.id,
          name: metric.name,
          icon: metric.icon,
          isAvailable: true,
          isSelected: widget.metrics?.includes(metric.id) ?? false,
        })),
      presets: presets
        .sort(({ name: nameA }, { name: nameB }) => nameA.localeCompare(nameB))
        .map((preset) => ({
          id: preset.id,
          name: preset.name,
          icon: preset.icon,
          isAvailable: true,
          isSelected: widget.preset === preset.id,
        })),
    };
  }
}
