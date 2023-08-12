import { DataSource } from './datasource';
import { Protocol } from '../../common/protocol';

export abstract class ProtocolDatasource<C, P> extends DataSource<
  C,
  P,
  Protocol
> {}
