export type TimeSeries<T> = Array<{
  timestamp: number;
  value: T;
}>;

export type UnitId = string;
export type Unit = {
  id: UnitId;
  symbol?: string;
  iconUrl?: string;
  name?: string;
};

export type Units = Record<UnitId, Unit>;

export type Entity<
  M extends Record<string, number | string>,
  V extends Record<string, number | Record<UnitId, number>>,
> = {
  id: string;
  meta: M;
  historicalMetrics: Record<
    keyof V,
    TimeSeries<number> | TimeSeries<Record<UnitId, number>>
  >;
  metrics: V;
};
