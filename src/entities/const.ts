import {
  META as WALLET_TOKEN_META,
  METRICS as WALLET_TOKEN_METRICS,
  ENTITY as WALLET_TOKEN_ENTITY,
} from './wallet-token.entity';
import {
  META as WALLET_META,
  METRICS as WALLET_METRICS,
  ENTITY as WALLET_ENTITY,
} from './wallet.entity';
import {
  META as PROTOCOL_META,
  METRICS as PROTOCOL_METRICS,
  ENTITY as PROTOCOL_ENTITY,
} from './protocol.entity';
import {
  META as TOKEN_META,
  METRICS as TOKEN_METRICS,
  ENTITY as TOKEN_ENTITY,
} from './token.entity';
import {
  META as CHAIN_META,
  METRICS as CHAIN_METRICS,
  ENTITY as CHAIN_ENTITY,
} from './chain.entity';
import {
  META as WALLET_NFT_META,
  METRICS as WALLET_NFT_METRICS,
  ENTITY as WALLET_NFT_ENTITY,
} from './wallet-nft.entity';

export const ENTITIES = [
  PROTOCOL_ENTITY,
  WALLET_ENTITY,
  WALLET_TOKEN_ENTITY,
  TOKEN_ENTITY,
  CHAIN_ENTITY,
  WALLET_NFT_ENTITY,
] as const;

export const FIELDS: Record<
  (typeof ENTITIES)[number],
  { meta: string[]; metrics: string[] }
> = {
  walletToken: {
    meta: WALLET_TOKEN_META,
    metrics: WALLET_TOKEN_METRICS,
  },
  wallet: {
    meta: WALLET_META,
    metrics: WALLET_METRICS,
  },
  protocol: {
    meta: PROTOCOL_META,
    metrics: PROTOCOL_METRICS,
  },
  token: {
    meta: TOKEN_META,
    metrics: TOKEN_METRICS,
  },
  chain: {
    meta: CHAIN_META,
    metrics: CHAIN_METRICS,
  },
  walletNFT: {
    meta: WALLET_NFT_META,
    metrics: WALLET_NFT_METRICS,
  },
};
