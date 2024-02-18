import { DappRadarDappDatasource } from './dapp-radar/dapp.datasource';
import { DebankWalletDatasource } from './debank/wallet.datasource';
import { DebankWalletTokenDatasource } from './debank/wallet-token.datasource';
import { ChainlinkTokenDataSource } from './chainlink/token.datasource';
import { BigQueryPublicDataChainDatasource } from './bigquery-public-data/network.datasource';
import { DebankWalletNFTDatasource } from './debank/wallet-nft.datasource';

export const collection = {
  'dapp-radar-dapp': DappRadarDappDatasource,
  'debank-wallet': DebankWalletDatasource,
  'debank-wallet-tokens': DebankWalletTokenDatasource,
  'chainlink-tokens': ChainlinkTokenDataSource,
  'bigquery-public-data-chains': BigQueryPublicDataChainDatasource,
  'debank-wallet-nft': DebankWalletNFTDatasource,
} as const;
