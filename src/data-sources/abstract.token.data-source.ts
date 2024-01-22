import { AbstractDataSource, Meta } from './abstract.data-source';
import { Token, ENTITY } from '../entities/token.entity';

export abstract class AbstractTokenDataSource<C, P> extends AbstractDataSource<
  C,
  P,
  Token,
  Meta
> {
  public static getEntity(): string {
    return ENTITY;
  }
}
