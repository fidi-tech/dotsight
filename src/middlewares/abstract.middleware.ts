import { AbstractDataSource } from '../data-sources/abstract.data-source';
import { collection } from '../mappers/collection';

class MiddlewareEntityNotSpecifiedError extends Error {}

export abstract class AbstractMiddleware<
  C,
  P,
  DS extends AbstractDataSource<any, any, any, any>,
> {
  constructor(protected readonly config: C) {}

  abstract transform(
    chunk: Awaited<ReturnType<DS['getItems']>>,
    params: P,
  ): ReturnType<DS['getItems']>;

  public static getEntity(): string {
    throw new MiddlewareEntityNotSpecifiedError();
  }

  getParamsByType(type: string) {
    return collection[type].getParamsSchema();
  }
}
