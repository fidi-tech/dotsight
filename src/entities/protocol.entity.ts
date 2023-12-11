import { UnitId, Entity } from './entity';

type Meta = {
  name?: string;
  logoUrl?: string;
};

type Metrics = {
  tvl?: Record<UnitId, number>;
  marketCap?: Record<UnitId, number>;
};

export const META: Array<keyof Meta> = ['name'];

export const METRICS: Array<keyof Metrics> = ['tvl', 'marketCap'];

export type Protocol = Entity<'protocol', Meta, Metrics>;
