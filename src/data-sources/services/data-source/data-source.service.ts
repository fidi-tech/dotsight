import { Injectable } from '@nestjs/common';
import { collection } from '../../collection';
import { AbstractDataSource } from '../../abstract.data-source';

class DataSourceNotFound extends Error {}

@Injectable()
export class DataSourceService {
  instantiate(
    type: string,
    config: object,
  ): AbstractDataSource<any, any, any, any> {
    const dataSource = collection[type];
    if (!dataSource) {
      throw new DataSourceNotFound(type);
    }
    return new dataSource(config);
  }
}
