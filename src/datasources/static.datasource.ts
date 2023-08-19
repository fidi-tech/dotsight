import { Units } from '../common/entity';
import { GetItemsResult } from '../models/datasource/datasource';
import { DataSource } from '../models/datasource/datasource';

type Config<E, M> = {
  units: Units;
  items: E[];
  meta: M;
};

type Params = Record<string, never>;

export class StaticDatasource<E, M> extends DataSource<
  Config<E, M>,
  Params,
  E,
  M
> {
  public async getItems(): Promise<GetItemsResult<E, M>> {
    return {
      units: this.config.units,
      items: this.config.items,
      meta: this.config.meta,
    };
  }
}
