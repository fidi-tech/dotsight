import { Entity, Unit, UnitId } from '../entities/entity';
import { validate } from 'jsonschema';

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
    validate(config, schema, {
      throwFirst: true,
      nestedErrors: true,
      required: true,
    });
  }

  abstract getItems(params: P): Promise<{
    items: T[];
    meta: M;
  }>;

  public static getEntity(): string {
    throw new DataSourceEntityNotSpecifiedError();
  }

  public static getConfigSchema(): object {
    throw new DatasourceConfigSchemaNotSpecifiedError();
  }
}
