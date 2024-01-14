import { UnitId, Entity } from './entity';

type Meta = {
  name?: string;
  logoUrl?: string;
};

type Metrics = {
  tvl?: Record<UnitId, number>;
  marketCap?: Record<UnitId, number>;
  uaw?: Record<UnitId, number>;
  volume?: Record<UnitId, number>;
  transactions?: Record<UnitId, number>;
  balance?: Record<UnitId, number>;
};

export const META: Array<keyof Meta> = ['name'];

export const METRICS: Array<keyof Metrics> = [
  'tvl',
  'marketCap',
  'uaw',
  'volume',
  'transactions',
  'balance',
];

export type Protocol = Entity<'protocol', Meta, Metrics>;
