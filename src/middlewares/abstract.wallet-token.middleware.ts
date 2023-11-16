import { AbstractMiddleware } from './abstract.middleware';
import { AbstractWalletTokenDataSource } from '../data-sources/abstract.wallet-token.data-source';

export abstract class AbstractWalletTokenMiddleware<
  C,
  P,
> extends AbstractMiddleware<C, P, AbstractWalletTokenDataSource<any, any>> {
  public static getEntity(): string {
    return 'walletToken';
  }
}
