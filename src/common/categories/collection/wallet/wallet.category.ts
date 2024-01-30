import {
  AbstractCategory,
  Subcategory,
  SubcategoryId,
} from '../../abstract.category';
import { isSupportedAddress, normalizeWalletId } from './validators';
import { metrics } from './metrics';

type Metrics = typeof metrics;

export class WalletCategory extends AbstractCategory<Metrics> {
  constructor() {
    super(metrics);
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
}
