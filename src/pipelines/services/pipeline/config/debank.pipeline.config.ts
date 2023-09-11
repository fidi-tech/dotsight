export default {
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
};
