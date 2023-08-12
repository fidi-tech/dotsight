export type TimeSeries<T> = Array<{
  timestamp: number;
  value: T;
}>;

export type CurrencyId = string;
export type Currency = {
  id: CurrencyId;
  symbol?: string;
  iconUrl?: string;
  name?: string;
};

export type Currencies = Record<CurrencyId, Currency>;

export type Entity<
  M,
  V extends Record<string, number | Record<CurrencyId, number>>,
> = {
  id: string;
  meta: M;
  historicalMetrics: Record<
    keyof V,
    TimeSeries<number> | TimeSeries<Record<CurrencyId, number>>
  >;
  metrics: V;
};
