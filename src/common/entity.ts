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

export type EntityId = string;

export type Entity<
  M extends Record<string, number | string | Record<UnitId, number>>,
  V extends Record<string, number | Record<UnitId, number>>,
> = {
  id: EntityId;
  meta: M;
  historicalMetrics: Record<
    keyof V,
    TimeSeries<number> | TimeSeries<Record<UnitId, number>>
  >;
  metrics: V;
};
