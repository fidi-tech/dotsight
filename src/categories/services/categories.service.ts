import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryDto } from '../dto/category.dto';
import {
  CategoryId,
  Subcategory,
  SubcategoryId,
} from '../../common/categories/abstract.category';
import { categories } from '../../common/categories/collection';

@Injectable()
export class CategoriesService {
  async queryCategories(): Promise<CategoryDto[]> {
    return Object.values(categories).map((category) => ({
      id: category.getId(),
      name: category.getName(),
      icon: category.getIcon(),
    }));
  }

  public findCategory(categoryId: CategoryId) {
    const category = categories[categoryId];
    if (!category) {
      throw new NotFoundException(`Category ${categoryId} not found`);
    }
    return category;
  }

  async findSubcategories(categoryId: CategoryId, query?: string) {
    const category = this.findCategory(categoryId);
    return category.getSubcategoriesByQuery(query);
  }

  async findSubcategoriesByIds(
    categoryId: CategoryId,
    subcategories: SubcategoryId[],
  ) {
    const category = this.findCategory(categoryId);
    const searchResults = await Promise.all(
      subcategories.map((subcategoryId) =>
        category.validateSubcategory(subcategoryId),
      ),
    );
    return searchResults.filter(Boolean) as Subcategory[];
  }

  async findMetrics(categoryId: CategoryId, query?: string) {
    const category = this.findCategory(categoryId);
    return category.getMetricsByQuery(query);
  }

  async findPresets(categoryId: CategoryId, query?: string) {
    const category = this.findCategory(categoryId);
    return category.getPresetsByQuery(query);
  }
}
