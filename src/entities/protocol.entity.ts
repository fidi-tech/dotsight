import { UnitId, Entity } from './entity';

export const ENTITY = 'protocol';

type Meta = {
  name?: string;
  logoUrl?: string;
};

export const PERCENTAGE_CHANGE_SUFFIX = 'PercentageChange';

type Metrics = {
  tvl?: Record<UnitId, number>;
  marketCap?: Record<UnitId, number>;
  uaw?: number;
  uawPercentageChange?: number;
  volume?: Record<UnitId, number>;
  volumePercentageChange?: number;
  transactions?: number;
  transactionsPercentageChange?: number;
  balance?: Record<UnitId, number>;
  balancePercentageChange?: number;
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
