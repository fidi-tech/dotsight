import { Entity } from '../entities/entity';
import { validate } from 'jsonschema';

class MapperTypeNotSpecifiedError extends Error {}
class MapperConfigSchemaNotSpecifiedError extends Error {}
class MapperDatashapeNotSpecifiedError extends Error {}

export abstract class AbstractMapper<C extends object, P, M, D> {
  constructor(protected readonly config: C) {
    // @ts-expect-error getting schema from child class
    const schema = this.constructor.getConfigSchema();
    validate(config, schema, {
      throwFirst: true,
      nestedErrors: true,
      required: true,
    });
  }

  public static getType(): string {
    throw new MapperTypeNotSpecifiedError();
  }

  public static getConfigSchema(): object {
    throw new MapperConfigSchemaNotSpecifiedError();
  }

  public static getDatashape(): string {
    throw new MapperDatashapeNotSpecifiedError();
  }

  public abstract map(
    items: Record<string, Entity<any, any, any>[]>,
    params: P,
    meta: M,
  ): D;

  public abstract getRequiredEntities(): string[];
}
