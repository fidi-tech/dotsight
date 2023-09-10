import { GiantSquidStatsWalletTokenDataSource } from './wallet-token.datasource';
import * as gql from 'graphql-request';
import { GraphQLClient } from 'graphql-request';

describe('GiantSquidStatsWalletTokenDataSource', () => {
  let dataSource: GiantSquidStatsWalletTokenDataSource;
  let request;

  beforeEach(() => {
    jest.spyOn(gql, 'gql').mockImplementation((strings) => {
      console.log(strings);
      return strings[0];
    });
    request = jest.fn();
    jest.spyOn(gql, 'GraphQLClient').mockImplementation(
      () =>
        ({
          request,
        } as GraphQLClient),
    );

    dataSource = new GiantSquidStatsWalletTokenDataSource({
      endpoint: 'ep',
      coin: {
        id: 'cid',
        name: 'cname',
        symbol: 'csymbol',
        decimals: 1,
      },
    });
  });

  it('should create gql client with correct params', () => {
    expect(GraphQLClient).toHaveBeenCalledWith('ep');
  });

  it('should call api with correct query', async () => {
    request.mockImplementation(() => ({
      accounts: [],
    }));

    await dataSource.getItems({ walletIds: ['w1', 'w2'] });

    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledWith(
      `
    query freeCoinQuery($ids: [String!]!) {
      accounts(where: { id_in: $ids }) {
        id
        free
      }
    }
  `,
      { ids: ['w1', 'w2'] },
    );
  });

  it('should aggregate items correctly', async () => {
    request.mockImplementation(() => ({
      accounts: [
        {
          id: 'w1',
          free: 1,
        },
        {
          id: 'w2',
          free: 2,
        },
      ],
    }));

    await expect(
      dataSource.getItems({ walletIds: ['w1', 'w2'] }),
    ).resolves.toEqual({
      items: [
        {
          entity: 'walletToken',
          historicalMetrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: 0.1,
              },
            ],
          },
          id: 'w1-cid',
          meta: {
            id: 'cid',
            name: 'cname',
            symbol: 'csymbol',
            walletId: 'w1',
          },
          metrics: {
            amount: 0.1,
          },
        },
        {
          entity: 'walletToken',
          historicalMetrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: 0.2,
              },
            ],
          },
          id: 'w2-cid',
          meta: {
            id: 'cid',
            name: 'cname',
            symbol: 'csymbol',
            walletId: 'w2',
          },
          metrics: {
            amount: 0.2,
          },
        },
      ],
      meta: {
        chains: {},
        protocols: {},
        units: {},
      },
    });
  });
});
