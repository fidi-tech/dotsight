import {
  AbstractCategory,
  Subcategory,
  SubcategoryId,
} from '../../abstract.category';
import { networks } from './networks';
import { metrics } from './metrics';

type Metrics = typeof metrics;

export class NetworkCategory extends AbstractCategory<Metrics> {
  constructor() {
    super(metrics);
  }

  getIcon() {
    return null;
  }

  getId() {
    return 'network';
  }

  getName(): string {
    return 'Network';
  }

  private async getSubcategories(): Promise<readonly Subcategory[]> {
    return networks;
  }

  async getSubcategoriesByQuery(
    query?: string,
  ): Promise<readonly Subcategory[]> {
    const subcategories = await this.getSubcategories();
    if (!query) {
      return subcategories;
    }
    return subcategories.filter((subcategory) =>
      subcategory.name.includes(query),
    );
  }

  async validateSubcategory(
    subcategoryId: SubcategoryId,
  ): Promise<Subcategory | null> {
    const subcategories = await this.getSubcategories();
    return subcategories.find(
      (subcategory) => subcategory.id === subcategoryId,
    );
  }
}
