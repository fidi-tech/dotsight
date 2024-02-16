import {
  AbstractCategory,
  PresetId,
  Subcategory,
  SubcategoryId,
} from '../../abstract.category';
import { networks } from './networks';
import { dapps } from './dapps';
import { metrics } from './metrics';

export type Metrics = typeof metrics;
// eslint-disable-next-line
export type Presets = {};

export class NetworkCategory extends AbstractCategory<Metrics, Presets> {
  constructor() {
    super(metrics, {});
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
    return [...networks, ...dapps];
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

  getMetricsByPreset(presetId: PresetId) {
    return null;
  }
}
