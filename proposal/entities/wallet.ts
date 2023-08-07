import { CurrencyId, Entity, TimeSeries } from './_common';

type Meta = object;
type HistoricalMetrics = {
  totalValue: TimeSeries<Record<CurrencyId, number>>;
};
type Metrics = {
  tokens: Record<CurrencyId, number>;
};

export type Wallet = Entity<Meta, HistoricalMetrics, Metrics>;
