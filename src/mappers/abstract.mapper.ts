import { Entity } from '../entities/entity';
import validator from '@rjsf/validator-ajv8';

class MapperNameNotSpecifiedError extends Error {}
class MapperDescriptionNotSpecifiedError extends Error {}
class MapperTypeNotSpecifiedError extends Error {}
class MapperConfigSchemaNotSpecifiedError extends Error {}
class MapperDatashapeNotSpecifiedError extends Error {}
class MapperParamsSchemaNotSpecifiedError extends Error {}

export abstract class AbstractMapper<C extends object, P, M, D> {
  constructor(protected readonly config: C) {
    // @ts-expect-error getting schema from child class
    const schema = this.constructor.getConfigSchema();
    const { errors } = validator.rawValidation(schema, config);
    if (errors?.length) {
      throw new Error(errors[0].message);
    }
  }

  public static getName(): string {
    throw new MapperNameNotSpecifiedError();
  }

  public static getDescription(): string {
    throw new MapperDescriptionNotSpecifiedError();
  }

  public static getType(): string {
    throw new MapperTypeNotSpecifiedError();
  }

  public static getConfigSchema(): object {
    throw new MapperConfigSchemaNotSpecifiedError();
  }

  public static getParamsSchema(): object {
    throw new MapperParamsSchemaNotSpecifiedError();
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
