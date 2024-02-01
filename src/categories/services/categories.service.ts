import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryDto } from '../dto/category.dto';
import { CategoryId } from '../../common/categories/abstract.category';
import { categories } from '../../common/categories/collection';

@Injectable()
export class CategoriesService {
  async queryCategories(): Promise<CategoryDto[]> {
    return categories.map((category) => ({
      id: category.getId(),
      name: category.getName(),
      icon: category.getIcon(),
    }));
  }

  private findCategory(categoryId: CategoryId) {
    const category = categories.find(
      (category) => category.getId() === categoryId,
    );
    if (!category) {
      throw new NotFoundException(`Category ${categoryId} not found`);
    }
    return category;
  }

  async findSubcategories(categoryId: CategoryId, query?: string) {
    const category = this.findCategory(categoryId);
    return category.getSubcategoriesByQuery(query);
  }

  async findMetrics(categoryId: CategoryId, query?: string) {
    const category = this.findCategory(categoryId);
    return category.getMetricsByQuery(query);
  }
}
