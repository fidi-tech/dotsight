import {
  AbstractDataSource,
  Entity,
  Meta,
  Params,
} from './abstract.data-source';
import { metrics } from '../common/categories/collection/wallet/metrics';
import { presets } from '../common/categories/collection/wallet/presets';
import { WalletCategory } from '../common/categories/collection/wallet/wallet.category';

export abstract class AbstractWalletDataSource<C> extends AbstractDataSource<
  C,
  typeof metrics,
  typeof presets,
  Meta
> {
  public static getCategory(): string {
    return new WalletCategory().getId();
  }

  abstract getItems(params: Params<typeof metrics>): Promise<{
    items: Entity<typeof metrics, typeof presets>[];
    meta: Meta;
  }>;
}
