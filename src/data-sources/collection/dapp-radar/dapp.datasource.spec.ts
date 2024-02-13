import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { BadRequestException } from '@nestjs/common';

import { DappRadarDappDatasource } from './dapp.datasource';

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

    dataSource = new DappRadarDappDatasource({
      key: '66',
      endpoint: 'https://some-valid-url.com',
    });
  });

  it('should throw if the config is wrong', () => {
    expect(() => new DappRadarDappDatasource({} as any)).toThrow();
    expect(() => new DappRadarDappDatasource({ key: '66' } as any)).toThrow();
    expect(
      () => new DappRadarDappDatasource({ key: '66', endpoint: [] } as any),
    ).toThrow();
    expect(
      () => new DappRadarDappDatasource({ key: [], endpoint: '42' } as any),
    ).toThrow();
  });

  it('should create axios instance with correct params', () => {
    expect(axiosCreate).toHaveBeenCalledWith({
      baseURL: 'https://some-valid-url.com',
      headers: new AxiosHeaders({
        'X-BLOBR-KEY': '66',
      }),
    });
  });

  it('should call dapp-radar api with correct params', async () => {
    mockAxios.get.mockImplementationOnce(() => ({
      data: {
        results: {
          dappId: 1,
          metrics: {},
        },
      },
    }));

    await dataSource.getItems({ dappId: 1, range: '24h' });

    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockAxios.get).toHaveBeenCalledWith('/dapps/1', {
      params: {
        range: '24h',
      },
    });
  });

  it('should reduce items correctly', async () => {
    mockAxios.get.mockImplementationOnce(() => ({
      data: {
        results: {
          dappId: '1',
          name: 'n1',
          logo: 'l1',
          metrics: {
            uaw: 1,
            uawPercentageChange: 2,
          },
        },
      },
    }));

    await expect(
      dataSource.getItems({ dappId: 1, range: '24h' }),
    ).resolves.toEqual({
      items: [
        {
          entity: 'protocol',
          metrics: {
            uaw: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: 1,
              },
            ],
          },
          id: '1',
          meta: {
            logoUrl: 'l1',
            name: 'n1',
          },
          metrics: {
            uaw: 1,
            uawPercentageChange: 2,
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

  it('should throw an error in case of wrong range', () => {
    expect(dataSource.getItems({ dappId: 1, range: '1h' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
