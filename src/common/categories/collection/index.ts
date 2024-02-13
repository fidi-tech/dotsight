import { WalletCategory } from './wallet/wallet.category';
import { NetworkCategory } from './network/network.category';

export const categories = {
  [new NetworkCategory().getId()]: new NetworkCategory(),
  [new WalletCategory().getId()]: new WalletCategory(),
} as const;
