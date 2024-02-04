import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Like, QueryRunner, Repository } from 'typeorm';
import { Widget, WidgetId } from '../../entities/widget.entity';
import { UserId } from '../../../users/entities/user.entity';
import { WidgetAbilityService } from '../widget-ability/widget-ability.service';
import {
  CategoryId,
  SubcategoryId,
} from '../../../common/categories/abstract.category';
import { CategoriesService } from '../../../categories/services/categories.service';
import { SubcategoryDto } from '../../dto/subcategory.dto';
import { MetricDto } from '../../dto/metric.dto';

@Injectable()
export class WidgetService {
  constructor(
    @InjectRepository(Widget)
    private readonly widgetRepository: Repository<Widget>,
    private readonly widgetAbilityService: WidgetAbilityService,
    private readonly categoriesService: CategoriesService,
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
    const subcategories = await this.categoriesService.findSubcategories(
      widget.category,
      query,
    );
    return subcategories.map((subcategory) => ({
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

    const [widget, suggestedSubcategories] = await Promise.all([
      this.findById(widgetId, null, qr),
      this.querySubcategories(userId, widgetId, undefined, qr),
    ]);
    const miss = subcategories.find(
      (subcategoryId) =>
        !suggestedSubcategories.find(
          (suggest) => suggest.id === subcategoryId && suggest.isAvailable,
        ),
    );
    if (miss) {
      throw new BadRequestException(`Subcategory ${miss} is not found`);
    }
    widget.subcategories = subcategories;
    return await this.getWidgetRepository(qr).save(widget);
  }

  async queryMetrics(
    userId: UserId,
    widgetId: WidgetId,
    query?: string,
    qr?: QueryRunner,
  ): Promise<MetricDto[]> {
    const widget = await this.findById(widgetId, null, qr);
    if (!widget.category) {
      return [];
    }
    const metrics = await this.categoriesService.findMetrics(
      widget.category,
      query,
    );
    return metrics.map((metric) => ({
      id: metric.id,
      name: metric.name,
      icon: metric.icon,
      isAvailable: true,
      isSelected: widget.metrics.includes(metric.id),
    }));
  }
}
