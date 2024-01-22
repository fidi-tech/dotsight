import { AbstractDataSource, Meta } from './abstract.data-source';
import {
  Chain,
  ChainId,
  Protocol,
  ProtocolId,
  WalletToken,
  ENTITY,
} from '../entities/wallet-token.entity';

export type WalletTokenMeta = Meta & {
  protocols: Record<ProtocolId, Protocol>;
  chains: Record<ChainId, Chain>;
};

export abstract class AbstractWalletTokenDataSource<
  C,
  P,
> extends AbstractDataSource<C, P, WalletToken, WalletTokenMeta> {
  public static getEntity(): string {
    return ENTITY;
  }
}
