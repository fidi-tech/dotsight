import { Entity } from '../entities/entity';

class MapperTypeNotSpecifiedError extends Error {}

export abstract class AbstractMapper<C extends object, P, M, D> {
  constructor(protected readonly config: C) {}

  public static getType(): string {
    throw new MapperTypeNotSpecifiedError();
  }

  public abstract map(
    items: Record<string, Entity<any, any, any>[]>,
    params: P,
    meta: M,
  ): D;

  public abstract getRequiredEntities(): string[];
}
