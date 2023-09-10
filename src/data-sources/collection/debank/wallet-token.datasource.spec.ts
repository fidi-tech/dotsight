import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { DebankWalletTokenDatasource } from './wallet-token.datasource';
import { BadRequestException } from '@nestjs/common';

jest.useFakeTimers();
jest.mock('../../../common/http');

describe('DebankWalletTokenDatasource', () => {
  let axiosCreate;
  let dataSource: DebankWalletTokenDatasource;

  const mockAxios = {
    get: jest.fn(),
  };
  beforeEach(() => {
    axiosCreate = jest.spyOn(axios, 'create');
    axiosCreate.mockImplementation(() => mockAxios as any as AxiosInstance);

    dataSource = new DebankWalletTokenDatasource({
      key: '66',
    });
  });

  it('should create axios instance with correct params', () => {
    expect(axiosCreate).toHaveBeenCalledWith({
      baseURL: 'https://pro-openapi.debank.com/v1',
      headers: new AxiosHeaders({
        AccessKey: '66',
      }),
    });
  });

  it('should throw is wrong params are passed', async () => {
    await expect(dataSource.getItems({ smth: 'else' } as any)).rejects.toThrow(
      BadRequestException,
    );
    await expect(
      dataSource.getItems({ walletIds: 'else' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should call api with correct params', async () => {
    mockAxios.get
      .mockImplementationOnce(() => ({
        data: [],
      }))
      .mockImplementationOnce(() => ({
        data: [],
      }));

    await dataSource.getItems({ walletIds: ['w1', 'w2'] });

    expect(mockAxios.get).toHaveBeenCalledTimes(2);
    expect(mockAxios.get).toHaveBeenCalledWith('/user/all_token_list', {
      params: {
        id: 'w1',
        is_all: true,
      },
    });
    expect(mockAxios.get).toHaveBeenCalledWith('/user/all_token_list', {
      params: {
        id: 'w2',
        is_all: true,
      },
    });
  });

  it('should aggregate items correctly', async () => {
    mockAxios.get
      .mockImplementationOnce(() => ({
        data: [
          {
            id: 'i1',
            chain: 'c1',
            symbol: 's1',
            logo_url: 'l1',
            name: 'n1',
            price: 1,
            amount: 10,
          },
          {
            id: 'i2',
            chain: 'c2',
            symbol: 's2',
            logo_url: 'l2',
            name: 'n2',
            price: 2,
            amount: 20,
          },
        ],
      }))
      .mockImplementationOnce(() => ({
        data: [
          {
            id: 'i3',
            chain: 'c1',
            symbol: 's3',
            logo_url: 'l3',
            name: 'n3',
            price: 3,
            amount: 30,
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
                value: 10,
              },
            ],
            value: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: {
                  usd: 10,
                },
              },
            ],
          },
          id: 'w1-i1',
          meta: {
            id: 'i1',
            chainId: 'c1',
            iconUrl: 'l1',
            name: 'n1',
            price: {
              usd: 1,
            },
            protocolId: null,
            symbol: 's1',
            walletId: 'w1',
          },
          metrics: {
            amount: 10,
            value: { usd: 10 },
          },
        },
        {
          entity: 'walletToken',
          historicalMetrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: 20,
              },
            ],
            value: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: { usd: 40 },
              },
            ],
          },
          id: 'w1-i2',
          meta: {
            id: 'i2',
            chainId: 'c2',
            iconUrl: 'l2',
            name: 'n2',
            price: {
              usd: 2,
            },
            protocolId: null,
            symbol: 's2',
            walletId: 'w1',
          },
          metrics: {
            amount: 20,
            value: { usd: 40 },
          },
        },
        {
          entity: 'walletToken',
          historicalMetrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: 30,
              },
            ],
            value: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: { usd: 90 },
              },
            ],
          },
          id: 'w2-i3',
          meta: {
            id: 'i3',
            chainId: 'c1',
            iconUrl: 'l3',
            name: 'n3',
            price: {
              usd: 3,
            },
            protocolId: null,
            symbol: 's3',
            walletId: 'w2',
          },
          metrics: {
            amount: 30,
            value: { usd: 90 },
          },
        },
      ],
      meta: {
        chains: {
          c1: {
            id: 'c1',
          },
          c2: {
            id: 'c2',
          },
        },
        protocols: {},
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
