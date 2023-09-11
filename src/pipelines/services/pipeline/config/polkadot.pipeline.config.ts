export default {
  id: 'polkadot-coin',
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
          },
        },
      },
    ],
  },
  mappers: [
    {
      id: 'dot-value-distribution',
      type: 'distribution',
      config: {
        nameField: 'walletId',
        valueField: 'value',
        entity: 'walletToken',
      },
    },
  ],
};
