import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { DebankWalletTokenProtocolDatasource } from './wallet-token.protocol.datasource';
import { BadRequestException } from '@nestjs/common';

jest.useFakeTimers();
jest.mock('../../../common/http');

describe('DebankWalletTokenProtocolDatasource', () => {
  let axiosCreate;
  let dataSource: DebankWalletTokenProtocolDatasource;

  const mockAxios = {
    get: jest.fn(),
  };
  beforeEach(() => {
    axiosCreate = jest.spyOn(axios, 'create');
    axiosCreate.mockImplementation(() => mockAxios as any as AxiosInstance);

    dataSource = new DebankWalletTokenProtocolDatasource({
      key: '66',
    });
  });

  it('should throw if the config is wrong', () => {
    expect(() => new DebankWalletTokenProtocolDatasource({})).toThrow();
    expect(
      () => new DebankWalletTokenProtocolDatasource({ key: [] }),
    ).toThrow();
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
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/user/all_complex_protocol_list',
      {
        params: {
          id: 'w1',
        },
      },
    );
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/user/all_complex_protocol_list',
      {
        params: {
          id: 'w2',
        },
      },
    );
  });

  it('should aggregate items correctly', async () => {
    mockAxios.get
      .mockImplementationOnce(() => ({
        data: [
          {
            id: 'p1',
            name: 'n1',
            portfolio_item_list: [
              {
                detail: {
                  supply_token_list: [
                    {
                      id: 't1',
                      chain: 'c1',
                      price: 1,
                      amount: 10,
                    },
                    {
                      id: 't2',
                      chain: 'c2',
                      price: 2,
                      amount: 20,
                    },
                  ],
                },
              },
            ],
          },
          {
            id: 'p2',
            name: 'n2',
            portfolio_item_list: [
              {
                detail: {
                  supply_token_list: [
                    {
                      id: 't3',
                      chain: 'c1',
                      price: 3,
                      amount: 30,
                    },
                  ],
                },
              },
            ],
          },
        ],
      }))
      .mockImplementationOnce(() => ({
        data: [
          {
            id: 'p2',
            name: 'n2',
            portfolio_item_list: [
              {
                detail: {
                  supply_token_list: [
                    {
                      id: 't4',
                      chain: 'c2',
                      price: 4,
                      amount: 40,
                    },
                  ],
                },
              },
            ],
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
          id: 'w1-p1-t1',
          meta: {
            id: 't1',
            chainId: 'c1',
            price: {
              usd: 1,
            },
            protocolId: 'p1',
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
          id: 'w1-p1-t2',
          meta: {
            id: 't2',
            chainId: 'c2',
            price: {
              usd: 2,
            },
            protocolId: 'p1',
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
          id: 'w1-p2-t3',
          meta: {
            id: 't3',
            chainId: 'c1',
            price: {
              usd: 3,
            },
            protocolId: 'p2',
            walletId: 'w1',
          },
          metrics: {
            amount: 30,
            value: { usd: 90 },
          },
        },
        {
          entity: 'walletToken',
          historicalMetrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: 40,
              },
            ],
            value: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: { usd: 160 },
              },
            ],
          },
          id: 'w2-p2-t4',
          meta: {
            id: 't4',
            chainId: 'c2',
            price: {
              usd: 4,
            },
            protocolId: 'p2',
            walletId: 'w2',
          },
          metrics: {
            amount: 40,
            value: { usd: 160 },
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
        protocols: {
          p1: {
            id: 'p1',
            name: 'n1',
          },
          p2: {
            id: 'p2',
            name: 'n2',
          },
        },
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
