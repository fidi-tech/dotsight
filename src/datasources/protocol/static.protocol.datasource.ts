import { ProtocolDatasource } from '../../models/datasource/protocol.datasource';
import { Protocol } from '../../common/protocol';
import { Units } from '../../common/entity';

type Config = {
  units: Units;
  protocols: Protocol[];
};

type Params = Record<string, never>;

export class StaticProtocolDatasource extends ProtocolDatasource<
  Config,
  Params
> {
  public async getItems(): Promise<{
    units: Units;
    items: Protocol[];
  }> {
    return {
      units: this.config.units,
      items: this.config.protocols,
    };
  }
}
