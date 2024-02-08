import { DappRadarProtocolDatasource } from './dapp-radar/protocol.datasource';
import { DappRadarDappDatasource } from './dapp-radar/dapp.datasource';
import { DebankWalletDatasource } from './debank/wallet.datasource';
import { DebankWalletTokenDatasource } from './debank/wallet-token.datasource';
import { DebankWalletTokenProtocolDatasource } from './debank/wallet-token.protocol.datasource';
import { Erc20Datasource } from './rpc/erc20.datasource';
import { ChainlinkTokenDataSource } from './chainlink/token.datasource';
import { BigQueryPublicDataChainDatasource } from './bigquery-public-data/chain.datasource';
import { DebankWalletNFTDatasource } from './debank/wallet-nft.datasource';

export const collection = {
  'dapp-radar-protocols': DappRadarProtocolDatasource,
  'dapp-radar-dapp': DappRadarDappDatasource,
  'debank-wallet': DebankWalletDatasource,
  'debank-wallet-tokens': DebankWalletTokenDatasource,
  'debank-protocol-tokens': DebankWalletTokenProtocolDatasource,
  'erc20-wallet-tokens': Erc20Datasource,
  'chainlink-tokens': ChainlinkTokenDataSource,
  'bigquery-public-data-chains': BigQueryPublicDataChainDatasource,
  'debank-wallet-nft': DebankWalletNFTDatasource,
} as const;

// checking if required static methods are implemented
for (const datasource of Object.values(collection)) {
  datasource.getName();
  datasource.getDescription();
  datasource.getConfigSchema();
  datasource.getParamsSchema();
}
