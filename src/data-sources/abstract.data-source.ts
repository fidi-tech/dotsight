import { Entity, Unit, UnitId } from '../entities/entity';
import validator from '@rjsf/validator-ajv8';

class DataSourceNameNotSpecifiedError extends Error {}
class DataSourceDescriptionNotSpecifiedError extends Error {}
class DataSourceEntityNotSpecifiedError extends Error {}
class DatasourceConfigSchemaNotSpecifiedError extends Error {}

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

  public static getEntity(): string {
    throw new DataSourceEntityNotSpecifiedError();
  }

  public static getConfigSchema(): object {
    throw new DatasourceConfigSchemaNotSpecifiedError();
  }
}
