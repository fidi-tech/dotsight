import { UnitId, Entity } from './entity';

type Meta = {
  name?: string;
  logoUrl?: string;
};

type Metrics = {
  uaw?: Record<UnitId, number>;
  volume?: Record<UnitId, number>;
  transactions?: Record<UnitId, number>;
  balance?: Record<UnitId, number>;
};

export const META: Array<keyof Meta> = ['name'];

export const METRICS: Array<keyof Metrics> = [
  'uaw',
  'volume',
  'transactions',
  'balance',
];

export type DApp = Entity<'dapp', Meta, Metrics>;
