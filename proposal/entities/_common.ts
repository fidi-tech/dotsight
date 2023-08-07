export type TimeSeries<T> = Array<{
  timestamp: number;
  value: T;
}>;

export type CurrencyId = string;
export type Currency = {
  id: CurrencyId;
  symbol?: string;
  iconUrl?: string; // icon???
  name?: string;
};

export type Entity<
  M,
  HV extends Record<
    string,
    TimeSeries<number> | TimeSeries<Record<CurrencyId, number>>
  >,
  V extends Record<string, number | Record<CurrencyId, number>>,
> = {
  id: string;
  meta: M;
  currencies: Record<CurrencyId, Currency>;
  historicalMetrics: HV;
  metrics: V;
};
