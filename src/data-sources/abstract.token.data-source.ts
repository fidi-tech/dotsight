import {
  AbstractDataSource,
  Entity,
  Meta,
  Params,
} from './abstract.data-source';
import { metrics } from '../common/categories/collection/token/metrics';
import { TokenCategory } from '../common/categories/collection/token/token.category';

export abstract class AbstractTokenDataSource<C> extends AbstractDataSource<
  C,
  typeof metrics,
  // eslint-disable-next-line
  {},
  Meta
> {
  public static getCategory(): string {
    return new TokenCategory().getId();
  }

  abstract getItems(params: Params<typeof metrics>): Promise<{
    items: Entity<typeof metrics, Record<string, never>>[];
    meta: Meta;
  }>;
}
