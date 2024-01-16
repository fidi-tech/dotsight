export const CHAINS = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    dataset: 'bigquery-public-data.goog_blockchain_ethereum_mainnet_us',
    location: 'US',
  },
} as const;

export type ChainType = keyof typeof CHAINS;

export type ChainParams = (typeof CHAINS)[keyof typeof CHAINS];
