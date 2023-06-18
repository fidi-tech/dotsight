import { Entity, UnitId } from './entity';

type Meta = Record<string, never>;

type Metrics = {
  netWorth: Record<UnitId, number>;
};

export type Wallet = Entity<'wallet', Meta, Metrics>;
