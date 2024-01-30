import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, QueryRunner, Repository } from 'typeorm';
import { Widget, WidgetId } from '../../entities/widget.entity';
import { UserId } from '../../../users/entities/user.entity';
import { WidgetAbilityService } from '../widget-ability/widget-ability.service';
import { CategoryId } from '../../../common/categories/abstract.category';
import { CategoriesService } from '../../../categories/services/categories.service';
import { SubcategoryDto } from '../../dto/subcategory.dto';

@Injectable()
export class WidgetService {
  constructor(
    @InjectRepository(Widget)
    private readonly widgetRepository: Repository<Widget>,
    private readonly widgetAbilityService: WidgetAbilityService,
    private readonly categoriesService: CategoriesService,
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
      where: { createdBy: { id: userId }, name: Like(`%${query}%`) },
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
    name?: string,
    qr?: QueryRunner,
  ) {
    const widget = await this.getWidgetRepository(qr).create();
    widget.category = category;
    if (name) {
      widget.name = name;
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
}
