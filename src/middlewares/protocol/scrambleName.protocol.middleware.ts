import { ProtocolMiddleware } from '../../models/middleware/protocol.middleware';
import { GetItemsResult } from '../../models/datasource/datasource';
import { Protocol } from '../../common/protocol';

type Config = Record<string, never>;

export class ScrambleNameProtocolMiddleware extends ProtocolMiddleware<Config> {
  async transform(
    items: GetItemsResult<Protocol, any>,
  ): Promise<GetItemsResult<Protocol, any>> {
    return {
      units: items.units,
      items: items.items.map((item) => ({
        ...item,
        meta: {
          ...item.meta,
          name: item.meta.name && item.meta.name.split('').reverse().join(''),
        },
      })),
      meta: items.meta,
    };
  }
}
