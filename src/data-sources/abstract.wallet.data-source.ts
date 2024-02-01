import { AbstractDataSource, Meta } from './abstract.data-source';
import { Wallet, ENTITY } from '../entities/wallet.entity';

export abstract class AbstractWalletDataSource<C, P> extends AbstractDataSource<
  C,
  P,
  Wallet,
  Meta
> {
  public static getCategory(): string {
    return ENTITY;
  }
}
