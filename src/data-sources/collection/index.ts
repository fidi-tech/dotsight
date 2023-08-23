import { DappRadarProtocolDatasource } from './dapp-radar/protocol.datasource';
import { DebankWalletDatasource } from './debank/wallet.datasource';
import { DebankWalletTokenDatasource } from './debank/wallet-token.datasource';
import { DebankWalletTokenProtocolDatasource } from './debank/wallet-token.protocol.datasource';

export const collection = {
  'dapp-radar-protocols': DappRadarProtocolDatasource,
  'debank-wallet': DebankWalletDatasource,
  'debank-wallet-tokens': DebankWalletTokenDatasource,
  'debank-protocol-tokens': DebankWalletTokenProtocolDatasource,
} as const;
