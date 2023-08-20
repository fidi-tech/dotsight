import { AbstractDataSource, Meta } from './abstract.data-source';
import { Protocol } from '../common/protocol';

export abstract class AbstractProtocolDataSource<
  C,
  P,
> extends AbstractDataSource<C, P, Protocol, Meta> {}
