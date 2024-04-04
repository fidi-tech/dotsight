import {
  AbstractCategory,
  PresetId,
  Subcategory,
  SubcategoryId,
} from '../../abstract.category';
import { tokens } from './tokens';
import { metrics } from './metrics';

export type Metrics = typeof metrics;
// eslint-disable-next-line
export type Presets = {};

export class TokenCategory extends AbstractCategory<Metrics, Presets> {
  constructor() {
    super(metrics, {});
  }

  getIcon() {
    return null;
  }

  getId() {
    return 'token';
  }

  getName(): string {
    return 'Token';
  }

  private async getSubcategories(): Promise<readonly Subcategory[]> {
    return tokens;
  }

  async getSubcategoriesByQuery(
    query?: string,
  ): Promise<readonly Subcategory[]> {
    const subcategories = await this.getSubcategories();
    if (!query) {
      return subcategories;
    }
    return subcategories.filter(
      (subcategory) =>
        subcategory.name.toLowerCase().includes(query.toLowerCase()) ||
        subcategory.id.toLowerCase().includes(query.toLowerCase()),
    );
  }

  async validateSubcategory(
    subcategoryId: SubcategoryId,
  ): Promise<Subcategory | null> {
    const subcategories = await this.getSubcategories();
    return (
      subcategories.find((subcategory) => subcategory.id === subcategoryId) ??
      null
    );
  }

  getMetricsByPreset(presetId: PresetId) {
    return null;
  }
}
