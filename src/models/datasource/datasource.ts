import { Units } from '../../common/entity';

export type GetItemsResult<T> = {
  units: Units;
  items: T[];
};

export abstract class DataSource<C, P, T> {
  constructor(protected readonly config: C) {}
  abstract getItems(params: P): Promise<GetItemsResult<T>>;
}
