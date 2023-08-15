import { ProtocolDatasource } from '../../models/datasource/protocol.datasource';
import { Protocol } from '../../common/protocol';
import { Units } from '../../common/entity';
import { GetItemsResult } from '../../models/datasource/datasource';

type Config = {
  units: Units;
  protocols: Protocol[];
};

type Params = Record<string, never>;

export class StaticProtocolDatasource extends ProtocolDatasource<
  Config,
  Params
> {
  public async getItems(): Promise<GetItemsResult<Protocol, null>> {
    return {
      units: this.config.units,
      items: this.config.protocols,
      meta: null,
    };
  }
}
