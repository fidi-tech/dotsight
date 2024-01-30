import { WalletCategory } from './wallet/wallet.category';
import { NetworkCategory } from './network/network.category';

export const categories = [
  new WalletCategory(),
  new NetworkCategory(),
] as const;
