import {
  AbstractCategory,
  PresetId,
  Subcategory,
  SubcategoryId,
} from '../../abstract.category';
import { isSupportedAddress, normalizeWalletId } from './validators';
import { metrics } from './metrics';
import { presets } from './presets';

export type Metrics = typeof metrics;
export type Presets = typeof presets;

export class WalletCategory extends AbstractCategory<Metrics, Presets> {
  constructor() {
    super(metrics, presets);
  }

  getIcon() {
    return null;
  }

  getId() {
    return 'wallet';
  }

  getName(): string {
    return 'Wallet';
  }

  async validateSubcategory(
    subcategoryId: SubcategoryId,
  ): Promise<Subcategory | null> {
    const normalized = normalizeWalletId(subcategoryId);
    if (isSupportedAddress(normalized)) {
      return { id: normalized, name: normalized, icon: null };
    }
    return null;
  }

  async getSubcategoriesByQuery(query?: string): Promise<Subcategory[]> {
    const subcategory = await this.validateSubcategory(query);
    return subcategory ? [subcategory] : [];
  }

  getMetricsByPreset(presetId: PresetId) {
    return presets[presetId]?.metrics ?? null;
  }
}
