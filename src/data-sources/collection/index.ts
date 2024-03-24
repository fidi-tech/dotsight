import { DappRadarDappDatasource } from './dapp-radar/dapp.datasource';
import { DebankWalletDatasource } from './debank/wallet.datasource';
import { DebankWalletTokenDatasource } from './debank/wallet-token.datasource';
import { BigQueryPublicDataChainDatasource } from './bigquery-public-data/network.datasource';
import { DebankWalletNFTDatasource } from './debank/wallet-nft.datasource';
import { ParityActiveAddressesNetworkDatasource } from './parity/active-addresses/network.datasource';
import { ParityTransactionsNetworkDatasource } from './parity/transactions/network.datasource';
import { ParityUniqueAddressesNetworkDatasource } from './parity/unique-addresses/network.datasource';
import { ParityPolkadotTreasuryNetworkDatasource } from './parity/polkadot-treasury/network.datasource';
import { EthereumChainlinkTokenDataSource } from './chainlink/ethereum/token.datasource';
import { MoonbeamChainlinkTokenDataSource } from './chainlink/moonbeam/token.datasource';

export const collection = {
  'dapp-radar-dapp': DappRadarDappDatasource,
  'debank-wallet': DebankWalletDatasource,
  'debank-wallet-tokens': DebankWalletTokenDatasource,
  'ethereum-chainlink-tokens': EthereumChainlinkTokenDataSource,
  'moonbeam-chainlink-tokens': MoonbeamChainlinkTokenDataSource,
  'bigquery-public-data-chains': BigQueryPublicDataChainDatasource,
  'debank-wallet-nft': DebankWalletNFTDatasource,
  'parity-active-addresses': ParityActiveAddressesNetworkDatasource,
  'parity-transactions': ParityTransactionsNetworkDatasource,
  'parity-unique-addresses': ParityUniqueAddressesNetworkDatasource,
  'polkadot-treasury': ParityPolkadotTreasuryNetworkDatasource,
} as const;
