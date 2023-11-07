export default {
  id: 'example',
  dataSources: {
    walletToken: [
      {
        id: 'polkadot-coin-gs',
        type: 'giant-squid-stats-wallet-token',
        config: {
          endpoint: 'https://squid.subsquid.io/gs-stats-polkadot/graphql',
          coin: {
            id: 'DOT',
            symbol: 'DOT',
            name: 'DOT',
            decimals: 10,
          },
        },
      },
      {
        id: 'kusama-coin-gs',
        type: 'giant-squid-stats-wallet-token',
        config: {
          endpoint: 'https://squid.subsquid.io/gs-stats-kusama/graphql', // see chains that are supported by Giant Squid here: https://docs.subsquid.io/giant-squid-api/statuses/
          coin: {
            id: 'KSM',
            symbol: 'KSM',
            name: 'KSM',
            decimals: 10,
          },
        },
      },
    ],
  },
  mixers: {
    walletToken: {},
  },
  middlewares: {
    walletToken: [
      {
        id: '11',
        type: 'coingecko-wallet-token-price',
        config: {
          key: process.env.COINGECKO_API_KEY,
          coinMapping: {
            DOT: 'polkadot',
            KSM: 'kusama', // can get coingecko's coin id from curl -X 'GET' 'https://api.coingecko.com/api/v3/coins/list' -H 'accept: application/json'
          },
        },
      },
    ],
  },
  mappers: [
    {
      id: 'token-distribution',
      type: 'distribution',
      config: {
        nameField: 'symbol', // any field from entity's meta, e.g. id, walletId, symbol, iconUrl, name, protocolId, chainId for walletToken
        valueField: 'value', // any field from entity's metrics, e.g. amount or value for walletToken
        entity: 'walletToken',
      },
    },
  ],
};
