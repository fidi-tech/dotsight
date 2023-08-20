import { AbstractDataSource, Meta } from './abstract.data-source';
import {
  Chain,
  ChainId,
  Protocol,
  ProtocolId,
  WalletToken,
} from '../common/walletToken';

export type WalletTokenMeta = Meta & {
  protocols: Record<ProtocolId, Protocol>;
  chains: Record<ChainId, Chain>;
};

export abstract class AbstractWalletTokenDataSource<
  C,
  P,
> extends AbstractDataSource<C, P, WalletToken, WalletTokenMeta> {}
