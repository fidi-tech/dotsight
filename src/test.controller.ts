import { Controller, Get, Query } from '@nestjs/common';
import { ProtocolMixer } from './models/mixer/protocol.mixer';
import { DappRadarProtocolDatasource } from './datasources/protocol/dappRadar.protocol.datasource';
import { StaticProtocolDatasource } from './datasources/protocol/static.protocol.datasource';
import { ScrambleNameProtocolMiddleware } from './middlewares/protocol/scrambleName.protocol.middleware';
import { DistributionMapper } from './models/mapper/distribution.mapper';
import { Protocol } from './common/protocol';

const config = {
  dataSources: {
    protocol: [
      new DappRadarProtocolDatasource({
        key: 'finxUrZGn5a0uJbtjj2FZi2CSAIp3VXm',
        endpoint: 'https://api.dappradar.com/trader',
      }),
      new StaticProtocolDatasource({
        units: {},
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
  mapper: new DistributionMapper<Protocol>({
    nameField: 'name',
    valueField: 'tvl',
  }),
};

@Controller('test')
export class TestController {
  @Get('/')
  async get(@Query() params) {
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

    return config.mapper.map(items, config.mapper.extractParameters(params));
  }
}
