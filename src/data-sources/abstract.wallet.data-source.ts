import { AbstractDataSource, Meta } from './abstract.data-source';
import { Wallet } from '../common/wallet';

export abstract class AbstractWalletDataSource<C, P> extends AbstractDataSource<
  C,
  P,
  Wallet,
  Meta
> {}
