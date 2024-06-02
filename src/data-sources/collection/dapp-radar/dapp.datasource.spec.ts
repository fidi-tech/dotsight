import axios, { AxiosHeaders, AxiosInstance } from 'axios';

import { DappRadarDappDatasource } from './dapp.datasource';
import { HISTORICAL_SCOPE } from '../../abstract.data-source';

jest.useFakeTimers();
jest.mock('../../../common/http');

describe('DappRadarDappDatasource', () => {
  let axiosCreate;
  let dataSource: DappRadarDappDatasource;

  const mockAxios = {
    get: jest.fn(),
  };
  beforeEach(() => {
    axiosCreate = jest.spyOn(axios, 'create');
    axiosCreate.mockImplementation(() => mockAxios as any as AxiosInstance);

    dataSource = new DappRadarDappDatasource(1, {
      key: '66',
      endpoint: 'https://some-valid-url.com',
    });
  });

  it('should create axios instance with correct params', () => {
    expect(axiosCreate).toHaveBeenCalledWith({
      baseURL: 'https://apis.dappradar.com/v2',
      headers: new AxiosHeaders({
        'X-API-KEY': '66',
      }),
    });
  });

  it('should call dapp-radar api with correct params', async () => {
    mockAxios.get.mockImplementationOnce(() => ({
      data: {
        results: [
          {
            timestamp: new Date().toISOString(),
            value: 100,
          },
        ],
      },
    }));

    await dataSource.getItems({
      subcategories: ['46618'],
      metrics: ['dailyTransactionsCount'],
      historicalScope: HISTORICAL_SCOPE.DAY,
    });

    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/dapps/46618/history/transactions',
      {
        params: {
          dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          dateTo: new Date().toISOString(),
        },
      },
    );
  });

  it('should reduce items correctly', async () => {
    mockAxios.get.mockImplementationOnce(() => ({
      data: {
        results: [
          {
            timestamp: Math.floor(Date.now() / 1000),
            value: 100,
          },
        ],
      },
    }));

    await expect(
      dataSource.getItems({
        subcategories: ['46618'],
        metrics: ['dailyTransactionsCount'],
        historicalScope: 'day',
      }),
    ).resolves.toEqual({
      items: [
        {
          metrics: {
            dailyTransactionsCount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: 100,
              },
            ],
          },
          id: '46618',
          icon: null,
          name: '46618',
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
