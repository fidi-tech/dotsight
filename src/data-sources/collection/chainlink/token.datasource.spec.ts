import * as gql from 'graphql-request';
import { GraphQLClient } from 'graphql-request';
import { ChainlinkTokenDataSource } from './token.datasource';

const latestRoundData = jest.fn();
const getDecimals = jest.fn();
const getRoundData = jest.fn();
class MockContract {
  get methods() {
    return {
      decimals: () => ({
        call: getDecimals,
      }),
      latestRoundData: () => ({
        call: latestRoundData,
      }),
      getRoundData: () => ({
        call: getRoundData,
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
      answer: `${24 * 60 * 60}`,
      updatedAt: 24 * 60 * 60,
      roundId: '111',
    });
    getDecimals.mockResolvedValue(2);
    for (let current = 23 * 60 * 60; current >= 0; current -= 60 * 60) {
      getRoundData.mockImplementationOnce(async () => {
        return {
          answer: `${current}`,
          updatedAt: current,
        };
      });
    }

    const expected = {
      items: [
        {
          entity: 'token',
          historicalMetrics: {
            price: [],
          },
          id: 'BTC',
          meta: {
            id: 'BTC',
            name: 'Bitcoin',
            symbol: 'BTC',
          },
          metrics: {
            price: {
              usd: 864,
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
    };
    for (let current = 0; current <= 24 * 60 * 60; current += 60 * 60) {
      expected.items[0].historicalMetrics.price.push({
        timestamp: current,
        value: {
          usd: Math.floor(current / 10 ** 2),
        },
      });
    }

    await expect(
      dataSource.getItems({ historicalScope: 'day' }),
    ).resolves.toEqual(expected);
  });
});
