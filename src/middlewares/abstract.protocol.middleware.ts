import { AbstractMiddleware } from './abstract.middleware';
import { AbstractProtocolDataSource } from '../data-sources/abstract.protocol.data-source';

export abstract class AbstractProtocolMiddleware<
  C,
  P,
> extends AbstractMiddleware<C, P, AbstractProtocolDataSource<any, any>> {}
