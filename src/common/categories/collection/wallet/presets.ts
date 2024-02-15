export const presets = {
  tokenContents: {
    id: 'tokenContents',
    name: 'Token contents',
    icon: null,
    metrics: {
      amount: {
        id: 'amount',
        name: 'Amount',
        icon: null,
      },
      price: {
        id: 'price',
        name: 'Price',
        icon: null,
      },
      value: {
        id: 'value',
        name: 'Value',
        icon: null,
      },
    },
  },
  nfts: {
    id: 'nfts',
    name: 'NFTs',
    icon: null,
    metrics: {
      price: {
        id: 'price',
        name: 'Last price',
        icon: null,
      },
    },
  },
} as const;
