import { DappRadarProtocolDatasource } from './dapp-radar/protocol.datasource';
import { DebankWalletDatasource } from './debank/wallet.datasource';
import { DebankWalletTokenDatasource } from './debank/wallet-token.datasource';
import { DebankWalletTokenProtocolDatasource } from './debank/wallet-token.protocol.datasource';
import { GiantSquidStatsWalletTokenDataSource } from './giant-squid/stats/wallet-token.datasource';
import { Erc20Datasource } from './rpc/erc20.datasource';

export const collection = {
  'dapp-radar-protocols': DappRadarProtocolDatasource,
  'debank-wallet': DebankWalletDatasource,
  'debank-wallet-tokens': DebankWalletTokenDatasource,
  'debank-protocol-tokens': DebankWalletTokenProtocolDatasource,
  'giant-squid-stats-wallet-token': GiantSquidStatsWalletTokenDataSource,
  'erc20-wallet-tokens': Erc20Datasource,
} as const;

// checking if required static methods are implemented
for (const datasource of Object.values(collection)) {
  datasource.getEntity();
  datasource.getConfigSchema();
}
