import { AbstractDataSource, Meta } from './abstract.data-source';
import { Chain } from '../entities/chain.entity';

export abstract class AbstractChainDataSource<C, P> extends AbstractDataSource<
  C,
  P,
  Chain,
  Meta
> {
  public static getEntity(): string {
    return 'chain';
  }
}
