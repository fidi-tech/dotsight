import { DappRadarProtocolDatasource } from './dapp-radar/protocol.datasource';
import { DappRadarDappDatasource } from './dapp-radar/dapp.datasource';
import { DebankWalletDatasource } from './debank/wallet.datasource';
import { DebankWalletTokenDatasource } from './debank/wallet-token.datasource';
import { DebankWalletTokenProtocolDatasource } from './debank/wallet-token.protocol.datasource';
import { GiantSquidStatsWalletTokenDataSource } from './giant-squid/stats/wallet-token.datasource';
import { Erc20Datasource } from './rpc/erc20.datasource';
import { ChainlinkTokenDataSource } from './chainlink/token.datasource';
import { BigQueryPublicDataChainDatasource } from './bigquery-public-data/chain.datasource';

export const collection = {
  'dapp-radar-protocols': DappRadarProtocolDatasource,
  'dapp-radar-dapp': DappRadarDappDatasource,
  'debank-wallet': DebankWalletDatasource,
  'debank-wallet-tokens': DebankWalletTokenDatasource,
  'debank-protocol-tokens': DebankWalletTokenProtocolDatasource,
  'giant-squid-stats-wallet-token': GiantSquidStatsWalletTokenDataSource,
  'erc20-wallet-tokens': Erc20Datasource,
  'chainlink-tokens': ChainlinkTokenDataSource,
  'bigquery-public-data-chains': BigQueryPublicDataChainDatasource,
} as const;

// checking if required static methods are implemented
for (const datasource of Object.values(collection)) {
  datasource.getName();
  datasource.getDescription();
  datasource.getEntity();
  datasource.getConfigSchema();
  datasource.getParamsSchema();
}
