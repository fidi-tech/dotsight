import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { DebankWalletDatasource } from './wallet.datasource';

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

    await dataSource.getItems({ subcategories: ['w1', 'w2'] });

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
      dataSource.getItems({ subcategories: ['w1', 'w2'] }),
    ).resolves.toEqual({
      items: [
        {
          metrics: {
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
          name: 'w1',
          icon: null,
        },
        {
          metrics: {
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
          name: 'w2',
          icon: null,
        },
      ],
      meta: {
        units: {
          usd: {
            icon: null,
            id: 'usd',
            name: 'US Dollar',
            symbol: '$',
          },
        },
      },
    });
  });
});
