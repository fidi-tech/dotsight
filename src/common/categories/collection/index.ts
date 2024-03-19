import { WalletCategory } from './wallet/wallet.category';
import { NetworkCategory } from './network/network.category';
import { TokenCategory } from './token/token.category';

export const categories = {
  [new NetworkCategory().getId()]: new NetworkCategory(),
  [new WalletCategory().getId()]: new WalletCategory(),
  [new TokenCategory().getId()]: new TokenCategory(),
} as const;
