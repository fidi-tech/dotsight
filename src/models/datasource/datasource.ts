import { Currencies } from '../../common/entity';

export type GetItemsResult<T> = {
  currencies: Currencies;
  items: T[];
};

export abstract class DataSource<C, P, T> {
  constructor(protected readonly config: C) {}
  abstract getItems(params: P): Promise<GetItemsResult<T>>;
}
