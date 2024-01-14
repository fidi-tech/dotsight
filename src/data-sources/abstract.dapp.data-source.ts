import { AbstractDataSource, Meta } from './abstract.data-source';
import { Protocol } from '../entities/protocol.entity';

export abstract class AbstractDappDataSource<C, P> extends AbstractDataSource<
  C,
  P,
  Protocol,
  Meta
> {
  public static getEntity(): string {
    return 'protocol';
  }
}
