const pipelines = [];

if (process.env.DEBANK_API_KEY) {
  pipelines.push({
    id: '1',
    dataSources: {
      walletToken: [
        {
          id: '1',
          type: 'debank-wallet-tokens',
          config: {
            key: process.env.DEBANK_API_KEY,
          },
        },
        {
          id: '1',
          type: 'debank-protocol-tokens',
          config: {
            key: process.env.DEBANK_API_KEY,
          },
        },
      ],
    },
    mixers: {
      walletToken: {},
    },
    middlewares: {
      walletToken: [],
    },
    mappers: [
      {
        id: 'distribution-1',
        type: 'distribution',
        config: {
          nameField: 'symbol',
          valueField: 'value',
          entity: 'walletToken',
        },
      },
    ],
  });
}

pipelines.push({
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
    walletToken: [],
  },
  mappers: [
    {
      id: 'dot-amount-distribution',
      type: 'distribution',
      config: {
        nameField: 'walletId',
        valueField: 'amount',
        entity: 'walletToken',
      },
    },
  ],
});

export default {
  pipelines,
} as const;
