import {
  MetricId,
  Metrics,
  Presets,
  SubcategoryId,
} from '../common/categories/abstract.category';
import { ApiProperty } from '@nestjs/swagger';
import { DataSourceId } from './entities/data-source.entity';

class DataSourceNameNotSpecifiedError extends Error {}
class DataSourceDescriptionNotSpecifiedError extends Error {}
class DataSourceCategoryNotSpecifiedError extends Error {}
class DataSourceSubcategoriesNotSpecifiedError extends Error {}
class DataSourceMetricsNotSpecifiedError extends Error {}
class DataSourcePresetNotSpecifiedError extends Error {}

export type UnitId = string;
export class Unit {
  @ApiProperty({
    description: 'unit id',
  })
  id: UnitId;

  @ApiProperty({
    description: 'unit symbol',
  })
  symbol: string;

  @ApiProperty({
    description: 'unit icon',
    nullable: true,
  })
  icon: string | null;

  @ApiProperty({
    description: 'unit name',
  })
  name: string;
}

export type Meta = {
  units: Record<UnitId, Unit>;
};

export const HISTORICAL_SCOPE = {
  DAY: 'day',
  MONTH: 'month',
} as const;

export type HistoricalScope =
  (typeof HISTORICAL_SCOPE)[keyof typeof HISTORICAL_SCOPE];

export type CommonParams = {
  historicalScope?: HistoricalScope;
};

export type Params<Me> = CommonParams & {
  subcategories: SubcategoryId[];
  metrics?: Array<keyof Me>;
  preset?: MetricId;
};

export type TimeSeries<T> = Array<{
  timestamp: number;
  value: T;
}>;

export type EntityId = string;

export type Entity<M extends Metrics, P extends Presets> = {
  id: EntityId;

  name: string;
  icon: string | null;

  metrics: Partial<
    Record<
      keyof (M | P[string]['metrics']),
      TimeSeries<number> | TimeSeries<Record<UnitId, number>>
    >
  >;
};

export abstract class AbstractDataSource<
  C,
  Me extends Metrics,
  P extends Presets,
  Ma extends Meta,
> {
  protected constructor(
    protected readonly id: DataSourceId,
    protected readonly config: C,
  ) {}

  abstract getItems(params: Params<Me>): Promise<{
    items: Entity<Me, P>[];
    meta: Ma;
  }>;

  public getId() {
    return this.id;
  }

  public static getName(): string {
    throw new DataSourceNameNotSpecifiedError();
  }

  abstract getCopyright(): { id: string; name: string; icon: null | string };

  public static getDescription(): string {
    throw new DataSourceDescriptionNotSpecifiedError();
  }

  public static getCategory(): string {
    throw new DataSourceCategoryNotSpecifiedError();
  }

  public static getSubcategories(
    subcategories: SubcategoryId[],
  ): SubcategoryId[] {
    throw new DataSourceSubcategoriesNotSpecifiedError();
  }

  public static getMetrics(metrics: MetricId[]): MetricId[] {
    throw new DataSourceMetricsNotSpecifiedError();
  }

  public static hasPreset(preset: MetricId): boolean {
    throw new DataSourcePresetNotSpecifiedError();
  }
}
