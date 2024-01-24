import { AbstractDataSource, Meta } from './abstract.data-source';
import { Protocol, ENTITY } from '../entities/protocol.entity';

export abstract class AbstractProtocolDataSource<
  C,
  P,
> extends AbstractDataSource<C, P, Protocol, Meta> {
  public static getEntity(): string {
    return ENTITY;
  }
}
