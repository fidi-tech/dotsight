import { AbstractCategory, SubcategoryId } from '../abstract.category';

export class NetworkCategory extends AbstractCategory {
  static getIcon() {
    return null;
  }

  static getId() {
    return 'afa23c15-42e5-44af-a0d9-324c279e6d94';
  }

  static getName(): string {
    return 'Network';
  }

  static validateSubcategory(subcategory: SubcategoryId) {
    return false;
  }
}
