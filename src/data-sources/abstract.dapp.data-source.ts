import { AbstractDataSource, Meta } from './abstract.data-source';
import { DApp } from '../entities/dapp.entity';

export abstract class AbstractDappDataSource<
  C,
  P,
> extends AbstractDataSource<C, P, DApp, Meta> {
  public static getEntity(): string {
    return 'dapp';
  }
}
