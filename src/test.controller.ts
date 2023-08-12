import { Controller, Get, Param } from '@nestjs/common';
import {
  ProtocolMixer,
  ProtocolMixerConfig,
} from './models/mixer/protocol.mixer';
import { ProtocolDatasource } from './models/datasource/protocol.datasource';
import { DappRadarProtocolDatasource } from './datasources/protocol/dappRadar.protocol.datasource';
import { StaticProtocolDatasource } from './datasources/protocol/static.protocol.datasource';
import { ProtocolMiddleware } from './models/middleware/protocol.middleware';
import { ScrambleNameProtocolMiddleware } from './middlewares/protocol/scrambleName.protocol.middleware';

const config: {
  dataSources: {
    protocol: ProtocolDatasource<any, any>[];
  };
  mixer: {
    protocol: ProtocolMixerConfig;
  };
  middlewares: {
    protocol: ProtocolMiddleware<any>[];
  };
} = {
  dataSources: {
    protocol: [
      new DappRadarProtocolDatasource({
        key: 'finxUrZGn5a0uJbtjj2FZi2CSAIp3VXm',
        endpoint: 'https://api.dappradar.com/trader',
      }),
      new StaticProtocolDatasource({
        currencies: {},
        protocols: [],
      }),
    ],
  },
  mixer: {
    protocol: {},
  },
  middlewares: {
    protocol: [
      new ScrambleNameProtocolMiddleware({}), // reverse the name
      new ScrambleNameProtocolMiddleware({}), // fix it back lol
    ],
  },
};

@Controller('test')
export class TestController {
  @Get('/')
  async get(@Param() params) {
    const chunks = await Promise.all(
      config.dataSources.protocol.map((dataSource) =>
        dataSource.getItems(params),
      ),
    );

    const protocolMixer = new ProtocolMixer(config.mixer.protocol);

    let items = await protocolMixer.mix(...chunks);

    for (const middleware of config.middlewares.protocol) {
      items = await middleware.transform(items);
    }

    return items;
  }
}
