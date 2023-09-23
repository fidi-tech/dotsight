import { AbstractDataSource, Meta } from './abstract.data-source';
import { Wallet } from '../entities/wallet.entity';

export abstract class AbstractWalletDataSource<C, P> extends AbstractDataSource<
  C,
  P,
  Wallet,
  Meta
> {
  public static getEntity(): string {
    return 'wallet';
  }
}
