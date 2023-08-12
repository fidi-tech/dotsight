import { Entity } from '../../common/entity';
import { GetItemsResult } from '../datasource/datasource';

export abstract class Mixer<C, E extends Entity<any, any>> {
  constructor(protected readonly config: C) {}
  public async mix(
    ...chunks: Array<GetItemsResult<E>>
  ): Promise<GetItemsResult<E>> {
    const result: GetItemsResult<E> = {
      currencies: {},
      items: [],
    };
    for (const chunk of chunks) {
      Object.assign(result.currencies, chunk.currencies);
      result.items.push(...chunk.items);
    }
    return result;
  }
}
