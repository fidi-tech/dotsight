export const CHAINS = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    dataset: 'bigquery-public-data.goog_blockchain_ethereum_mainnet_us',
    location: 'US',
  },
  avalanche: {
    id: 'avalanche',
    name: 'Avalanche',
    dataset: 'bigquery-public-data.goog_blockchain_avalanche_contract_chain_us',
    location: 'US',
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    dataset: 'bigquery-public-data.goog_blockchain_arbitrum_one_us',
    location: 'US',
  },
} as const;

export type ChainType = keyof typeof CHAINS;

export type ChainParams = (typeof CHAINS)[keyof typeof CHAINS];
