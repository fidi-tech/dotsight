import { Entity, Unit, UnitId } from '../entities/entity';
import validator from '@rjsf/validator-ajv8';
import {
  MetricId,
  SubcategoryId,
} from '../common/categories/abstract.category';

class DataSourceNameNotSpecifiedError extends Error {}
class DataSourceDescriptionNotSpecifiedError extends Error {}
class DataSourceCategoryNotSpecifiedError extends Error {}
class DataSourceSubcategoriesNotSpecifiedError extends Error {}
class DataSourceMetricsNotSpecifiedError extends Error {}
class DatasourceConfigSchemaNotSpecifiedError extends Error {}
class DatasourceParamsSchemaNotSpecifiedError extends Error {}

export type Meta = {
  units: Record<UnitId, Unit>;
};

export abstract class AbstractDataSource<
  C,
  P,
  T extends Entity<any, any, any>,
  M extends Meta,
> {
  constructor(protected readonly config: C) {
    // @ts-expect-error getting schema from child class
    const schema = this.constructor.getConfigSchema();
    const { errors } = validator.rawValidation(schema, config);
    if (errors?.length) {
      throw new Error(errors[0].message);
    }
  }

  abstract getItems(params: P): Promise<{
    items: T[];
    meta: M;
  }>;

  public static getName(): string {
    throw new DataSourceNameNotSpecifiedError();
  }

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

  public static getConfigSchema(): object {
    throw new DatasourceConfigSchemaNotSpecifiedError();
  }

  public static getParamsSchema(): object {
    throw new DatasourceParamsSchemaNotSpecifiedError();
  }
}
