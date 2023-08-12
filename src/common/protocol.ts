import { CurrencyId, Entity } from './entity';

type Meta = {
  name?: string;
  logoUrl?: string;
};

type Metrics = {
  tvl?: Record<CurrencyId, number>;
  marketCap?: Record<CurrencyId, number>;
};

export type Protocol = Entity<Meta, Metrics>;
