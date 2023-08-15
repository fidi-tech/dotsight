import { DataSource } from './datasource';
import { Wallet } from '../../common/wallet';

export abstract class WalletDatasource<C, P> extends DataSource<
  C,
  P,
  Wallet,
  null
> {}
