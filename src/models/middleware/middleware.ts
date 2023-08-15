import { Entity } from '../../common/entity';
import { GetItemsResult } from '../datasource/datasource';

export abstract class Middleware<C, E extends Entity<any, any>> {
  constructor(protected readonly config: C) {}
  public abstract transform(
    items: GetItemsResult<E, any>,
  ): Promise<GetItemsResult<E, any>>;
}
