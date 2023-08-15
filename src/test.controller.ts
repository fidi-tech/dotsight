import { Controller, Get, Query } from '@nestjs/common';
import { ProtocolMixer } from './models/mixer/protocol.mixer';
import { DappRadarProtocolDatasource } from './datasources/protocol/dappRadar.protocol.datasource';
import { StaticProtocolDatasource } from './datasources/protocol/static.protocol.datasource';
import { ScrambleNameProtocolMiddleware } from './middlewares/protocol/scrambleName.protocol.middleware';
import { DistributionMapper } from './models/mapper/distribution.mapper';
import { Protocol } from './common/protocol';
import { DebankWalletDatasource } from './datasources/wallet/debank.wallet.datasource';
import { WalletMixer } from './models/mixer/wallet.mixer';
import { Wallet } from './common/wallet';
import { DebankWalletWalletTokenDatasource } from './datasources/walletToken/debank.wallet.walletToken.datasource';
import { DebankProtocolsWalletTokenDatasource } from './datasources/walletToken/debank.protocols.walletToken.datasource';
import { WalletToken } from './common/walletToken';
import { WalletTokenMixer } from './models/mixer/walletToken.mixer';

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
    wallet: [
      new DebankWalletDatasource({
        key: 'fa75515db8e00ed189d593bd00bbdeee453caa98',
      }),
    ],
    walletToken: [
      new DebankWalletWalletTokenDatasource({
        key: 'fa75515db8e00ed189d593bd00bbdeee453caa98',
      }),
      new DebankProtocolsWalletTokenDatasource({
        key: 'fa75515db8e00ed189d593bd00bbdeee453caa98',
      }),
    ],
  },
  mixer: {
    protocol: {},
    wallet: {},
    walletToken: {},
  },
  middlewares: {
    protocol: [
      new ScrambleNameProtocolMiddleware({}), // reverse the name
      new ScrambleNameProtocolMiddleware({}), // fix it back lol
    ],
    wallet: [],
    walletToken: [],
  },
  mapper: {
    protocol: new DistributionMapper<Protocol>({
      nameField: 'name',
      valueField: 'tvl',
    }),
    wallet: new DistributionMapper<Wallet>({
      nameField: 'name',
      valueField: 'netWorth',
    }),
    walletToken: new DistributionMapper<WalletToken>({
      nameField: 'symbol',
      valueField: 'value',
    }),
  },
};

@Controller('test')
export class TestController {
  @Get('/protocols')
  async getProtocols(@Query() params) {
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

    return config.mapper.protocol.map(
      items,
      config.mapper.protocol.extractParameters(params),
    );
  }

  @Get('/wallets')
  async getWallets(@Query() params) {
    const chunks = await Promise.all(
      config.dataSources.wallet.map((dataSource) =>
        dataSource.getItems(params),
      ),
    );

    const walletMixer = new WalletMixer(config.mixer.wallet);

    let items = await walletMixer.mix(...chunks);

    for (const middleware of config.middlewares.wallet) {
      items = await middleware.transform(items);
    }

    return config.mapper.wallet.map(
      items,
      config.mapper.wallet.extractParameters(params),
    );
  }

  @Get('/walletTokens')
  async getWalletTokens(@Query() params) {
    const chunks = await Promise.all(
      config.dataSources.walletToken.map((dataSource) =>
        dataSource.getItems(params),
      ),
    );

    const walletTokenMixer = new WalletTokenMixer(config.mixer.walletToken);

    let items = await walletTokenMixer.mix(...chunks);

    for (const middleware of config.middlewares.walletToken) {
      items = await middleware.transform(items);
    }

    return config.mapper.walletToken.map(
      items,
      config.mapper.walletToken.extractParameters(params),
    );
  }
}
