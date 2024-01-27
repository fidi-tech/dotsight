import { Injectable } from '@nestjs/common';
import { categories } from '../collection';
import { CategoryDto } from '../dto/category.dto';
import { CategoryId } from '../abstract.category';

@Injectable()
export class CategoriesService {
  async getCategories(): Promise<CategoryDto[]> {
    return Object.values(categories).map((category) => ({
      id: category.getId(),
      name: category.getName(),
      icon: category.getIcon(),
    }));
  }

  async getSubcategories(categoryId: CategoryId) {}
}
