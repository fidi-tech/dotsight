import { AbstractMiddleware } from './abstract.middleware';
import { AbstractWalletDataSource } from '../data-sources/abstract.wallet.data-source';

export abstract class AbstractWalletMiddleware<C, P> extends AbstractMiddleware<
  C,
  P,
  AbstractWalletDataSource<any, any>
> {
  public static getEntity(): string {
    return 'wallet';
  }
}
