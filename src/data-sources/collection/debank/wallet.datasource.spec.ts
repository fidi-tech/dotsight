import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { DebankWalletDatasource } from './wallet.datasource';
import { BadRequestException } from '@nestjs/common';

jest.useFakeTimers();
jest.mock('../../../common/http');

describe('DebankWalletDatasource', () => {
  let axiosCreate;
  let dataSource: DebankWalletDatasource;

  const mockAxios = {
    get: jest.fn(),
  };
  beforeEach(() => {
    axiosCreate = jest.spyOn(axios, 'create');
    axiosCreate.mockImplementation(() => mockAxios as any as AxiosInstance);

    dataSource = new DebankWalletDatasource({
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
        data: {
          total_usd_value: 1,
        },
      }))
      .mockImplementationOnce(() => ({
        data: {
          total_usd_value: 2,
        },
      }));

    await dataSource.getItems({ walletIds: ['w1', 'w2'] });

    expect(mockAxios.get).toHaveBeenCalledTimes(2);
    expect(mockAxios.get).toHaveBeenCalledWith('/user/total_balance', {
      params: {
        id: 'w1',
      },
    });
    expect(mockAxios.get).toHaveBeenCalledWith('/user/total_balance', {
      params: {
        id: 'w2',
      },
    });
  });

  it('should aggregate items correctly', async () => {
    mockAxios.get
      .mockImplementationOnce(() => ({
        data: {
          total_usd_value: 1,
        },
      }))
      .mockImplementationOnce(() => ({
        data: {
          total_usd_value: 2,
        },
      }));

    await expect(
      dataSource.getItems({ walletIds: ['w1', 'w2'] }),
    ).resolves.toEqual({
      items: [
        {
          entity: 'wallet',
          historicalMetrics: {
            netWorth: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: {
                  usd: 1,
                },
              },
            ],
          },
          id: 'w1',
          meta: {},
          metrics: {
            netWorth: {
              usd: 1,
            },
          },
        },
        {
          entity: 'wallet',
          historicalMetrics: {
            netWorth: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: {
                  usd: 2,
                },
              },
            ],
          },
          id: 'w2',
          meta: {},
          metrics: {
            netWorth: {
              usd: 2,
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
