import { ProtocolDatasource } from '../../models/datasource/protocol.datasource';
import { Protocol } from '../../common/protocol';
import { Currencies } from '../../common/entity';

type Config = {
  currencies: Currencies;
  protocols: Protocol[];
};

type Params = Record<string, never>;

export class StaticProtocolDatasource extends ProtocolDatasource<
  Config,
  Params
> {
  public async getItems(): Promise<{
    currencies: Currencies;
    items: Protocol[];
  }> {
    return {
      currencies: this.config.currencies,
      items: this.config.protocols,
    };
  }
}
