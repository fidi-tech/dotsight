import { Units } from '../../common/entity';

export type GetItemsResult<T, M> = {
  units: Units;
  items: T[];
  meta: M;
};

export abstract class DataSource<C, P, T, M> {
  constructor(protected readonly config: C) {}
  abstract getItems(params: P): Promise<GetItemsResult<T, M>>;
}
