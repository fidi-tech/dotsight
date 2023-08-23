import { Entity, UnitId } from './entity';

export type ProtocolId = string;

export type Protocol = {
  id: ProtocolId;
  name?: string;
};

export type ChainId = string;

export type Chain = {
  id: ChainId;
  name?: string;
};

type Meta = {
  walletId: string;
  symbol?: string;
  iconUrl?: string;
  name?: string;
  protocolId?: ProtocolId | null;
  chainId?: ChainId | null;
  price?: Record<UnitId, number>;
};

type Metrics = {
  amount?: number;
  value?: Record<UnitId, number>;
};

export type WalletToken = Entity<'walletToken', Meta, Metrics>;
