import { CurrencyId, Entity, TimeSeries } from './_common';

type Meta = {
  name: string;
};

type HistoricalMetrics = {
  tvl: TimeSeries<Record<CurrencyId, number>>;
  transactions: TimeSeries<number>;
};

type Metrics = Record<string, never>;

export type Protocol = Entity<Meta, HistoricalMetrics, Metrics>;
