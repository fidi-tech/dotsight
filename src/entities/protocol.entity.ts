import { UnitId, Entity } from './entity';

type Meta = {
  name?: string;
  logoUrl?: string;
};

type Metrics = {
  tvl?: Record<UnitId, number>;
  marketCap?: Record<UnitId, number>;
};

export type Protocol = Entity<'protocol', Meta, Metrics>;
