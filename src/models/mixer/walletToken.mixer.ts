import { Mixer } from './mixer';
import { WalletToken } from '../../common/walletToken';
import { GetItemsResult } from '../datasource/datasource';
import { Meta } from '../datasource/walletToken.datasource';

export type WalletTokenMixerConfig = Record<string, never>;

export class WalletTokenMixer extends Mixer<
  WalletTokenMixerConfig,
  WalletToken
> {
  public async mix(
    ...chunks: Array<GetItemsResult<WalletToken, Meta>>
  ): Promise<GetItemsResult<WalletToken, Meta>> {
    const result: GetItemsResult<WalletToken, Meta> = {
      units: {},
      items: [],
      meta: {
        protocols: {},
        chains: {},
      },
    };
    for (const chunk of chunks) {
      Object.assign(result.units, chunk.units);
      result.items.push(...chunk.items);
      Object.assign(result.meta.protocols, chunk.meta.protocols);
      Object.assign(result.meta.chains, chunk.meta.chains);
    }
    return result;
  }
}
