import { Entity } from '../../common/entity';
import { GetItemsResult } from '../datasource/datasource';

export abstract class Mapper<C, P, E extends Entity<any, any>, D> {
  constructor(protected readonly config: C) {}
  public abstract extractParameters(params: Record<string, any>): P;
  public abstract map(e: GetItemsResult<E>, params: P): D;
}
