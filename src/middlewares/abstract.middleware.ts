import { AbstractDataSource } from '../data-sources/abstract.data-source';

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
}
