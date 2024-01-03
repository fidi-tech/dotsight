import * as gql from 'graphql-request';
import { GraphQLClient } from 'graphql-request';
import { ChainlinkTokenDataSource } from './token.datasource';

const latestRoundData = jest.fn();
const getDecimals = jest.fn();
class MockContract {
  get methods() {
    return {
      decimals: () => ({
        call: getDecimals,
      }),
      latestRoundData: () => ({
        call: latestRoundData,
      }),
    };
  }
}
jest.mock('web3', () => ({
  Web3: class MockWeb3 {
    get eth() {
      return {
        Contract: MockContract,
      };
    }
  },
}));
describe('ChainlinkTokenDataSource', () => {
  let dataSource: ChainlinkTokenDataSource;
  let request;

  beforeEach(() => {
    jest.spyOn(gql, 'gql').mockImplementation((strings) => {
      return strings[0];
    });
    request = jest.fn();
    jest.spyOn(gql, 'GraphQLClient').mockImplementation(
      () =>
        ({
          request,
        } as GraphQLClient),
    );

    dataSource = new ChainlinkTokenDataSource({
      token: 'BTC',
      rpc: 'https://rpc.ankr.com/eth',
    });
  });

  it('should throw if the config is wrong', () => {
    expect(() => new ChainlinkTokenDataSource({} as any)).toThrow();
    expect(() => new ChainlinkTokenDataSource({ rpc: '12' } as any)).toThrow();
    expect(
      () =>
        new ChainlinkTokenDataSource({
          rpc: 'https://localhost/',
          token: [],
        } as any),
    ).toThrow();
    expect(
      () =>
        new ChainlinkTokenDataSource({
          rpc: 'https://localhost/',
          token: {},
        } as any),
    ).toThrow();
  });

  it('should return correct data', async () => {
    latestRoundData.mockResolvedValue({
      answer: '3100000',
      updatedAt: 1,
      roundId: '111',
    });
    getDecimals.mockResolvedValue(2);

    await expect(dataSource.getItems({})).resolves.toEqual({
      items: [
        {
          entity: 'token',
          historicalMetrics: {
            price: [
              {
                timestamp: 1000,
                value: {
                  usd: 31000,
                },
              },
            ],
          },
          id: 'BTC',
          meta: {
            id: 'BTC',
            name: 'Bitcoin',
            symbol: 'BTC',
          },
          metrics: {
            price: {
              usd: 31000,
            },
          },
        },
      ],
      meta: {
        units: {
          usd: {
            id: 'usd',
            name: 'US Dollar',
            symbol: '$',
          },
        },
      },
    });
  });
});
