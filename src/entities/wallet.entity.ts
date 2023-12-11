import { Entity, UnitId } from './entity';

type Meta = {
  walletId: string;
};

type Metrics = {
  netWorth: Record<UnitId, number>;
};

export const META: Array<keyof Meta> = ['walletId'];

export const METRICS: Array<keyof Metrics> = ['netWorth'];

export type Wallet = Entity<'wallet', Meta, Metrics>;
