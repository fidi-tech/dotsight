import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { DebankWalletTokenDatasource } from './wallet-token.datasource';

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

  it('should call api with correct params', async () => {
    mockAxios.get
      .mockImplementationOnce(() => ({
        data: [],
      }))
      .mockImplementationOnce(() => ({
        data: [],
      }));

    await dataSource.getItems({ subcategories: ['w1', 'w2'] });

    expect(mockAxios.get).toHaveBeenCalledTimes(2);
    expect(mockAxios.get).toHaveBeenCalledWith('/user/all_token_list', {
      params: {
        id: 'w1',
        is_all: false,
      },
    });
    expect(mockAxios.get).toHaveBeenCalledWith('/user/all_token_list', {
      params: {
        id: 'w2',
        is_all: false,
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
      dataSource.getItems({ subcategories: ['w1', 'w2'] }),
    ).resolves.toEqual({
      items: [
        {
          icon: null,
          id: 'i1-c1',
          name: 'n1',
          metrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: 10,
              },
            ],
            price: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: {
                  usd: 1,
                },
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
        },
        {
          metrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: 20,
              },
            ],
            price: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: {
                  usd: 2,
                },
              },
            ],
            value: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: { usd: 40 },
              },
            ],
          },
          id: 'i2-c2',
          name: 'n2',
          icon: null,
        },
        {
          metrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: 30,
              },
            ],
            price: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: {
                  usd: 3,
                },
              },
            ],
            value: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: { usd: 90 },
              },
            ],
          },
          id: 'i3-c1',
          name: 'n3',
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
