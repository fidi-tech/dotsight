import { Unit, UnitId } from '../entities/entity';

export type Meta = {
  units: Record<UnitId, Unit>;
};

export abstract class AbstractDataSource<C, P, T, M extends Meta> {
  constructor(protected readonly config: C) {}
  abstract getItems(params: P): Promise<{
    items: T[];
    meta: M;
  }>;
}
