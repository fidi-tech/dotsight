import {
  AbstractDataSource,
  Entity,
  Meta,
  Params,
} from './abstract.data-source';
import { NetworkCategory } from '../common/categories/collection/network/network.category';
import { metrics } from '../common/categories/collection/network/metrics';

export abstract class AbstractNetworkDataSource<C> extends AbstractDataSource<
  C,
  typeof metrics,
  // eslint-disable-next-line
  {},
  Meta
> {
  public static getCategory(): string {
    return new NetworkCategory().getId();
  }

  abstract getItems(params: Params<typeof metrics>): Promise<{
    items: Entity<typeof metrics, Record<string, never>>[];
    meta: Meta;
  }>;
}
