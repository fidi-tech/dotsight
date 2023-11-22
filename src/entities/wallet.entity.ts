import { Entity, UnitId } from './entity';

type Meta = {
  walletId: string;
};

type Metrics = {
  netWorth: Record<UnitId, number>;
};

export type Wallet = Entity<'wallet', Meta, Metrics>;
