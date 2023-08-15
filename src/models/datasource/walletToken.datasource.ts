import { DataSource } from './datasource';
import {
  Chain,
  ChainId,
  Protocol,
  ProtocolId,
  WalletToken,
} from '../../common/walletToken';

export type Meta = {
  protocols: Record<ProtocolId, Protocol>;
  chains: Record<ChainId, Chain>;
};

export abstract class WalletTokenDatasource<C, P> extends DataSource<
  C,
  P,
  WalletToken,
  Meta
> {}
