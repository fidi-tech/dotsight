import { Entity, TimeSeries } from './_common';

type Meta = {
  name: string;
  iconUrl?: string;
};

type HistoricalMetrics = {
  transactions: TimeSeries<number>;
};

type Metrics = Record<string, never>;

export type Chain = Entity<Meta, HistoricalMetrics, Metrics>;
