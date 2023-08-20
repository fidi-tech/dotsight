import { Entity } from '../common/entity';
import { Meta } from '../data-sources/abstract.data-source';

export abstract class AbstractMixer<C, E extends Entity<any, any, any>> {
  constructor(protected readonly config: C) {}
  public async mix(
    ...chunks: Array<{
      items: E[];
      meta: Meta;
    }>
  ): Promise<{
    items: E[];
    meta: Meta;
  }> {
    const result: {
      items: E[];
      meta: Meta;
    } = {
      items: [],
      meta: {
        units: {},
      },
    };
    for (const chunk of chunks) {
      Object.assign(result.meta.units, chunk.meta.units);
      result.items.push(...chunk.items);
    }
    return result;
  }
}
