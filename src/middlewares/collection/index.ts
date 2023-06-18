import { CoingeckoWalletTokenPriceMiddleware } from './coingecko/wallet-token-price.middleware';

export const collection = {
  'coingecko-wallet-token-price': CoingeckoWalletTokenPriceMiddleware,
} as const;
