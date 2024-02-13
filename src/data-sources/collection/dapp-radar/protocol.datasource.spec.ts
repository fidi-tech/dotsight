import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { DappRadarProtocolDatasource } from './protocol.datasource';

jest.useFakeTimers();
jest.mock('../../../common/http');

describe('DappRadarProtocolDatasource', () => {
  let axiosCreate;
  let dataSource: DappRadarProtocolDatasource;

  const mockAxios = {
    get: jest.fn(),
  };
  beforeEach(() => {
    axiosCreate = jest.spyOn(axios, 'create');
    axiosCreate.mockImplementation(() => mockAxios as any as AxiosInstance);

    dataSource = new DappRadarProtocolDatasource({
      key: '66',
      endpoint: 'https://some-valid-url.com',
    });
  });

  it('should throw if the config is wrong', () => {
    expect(() => new DappRadarProtocolDatasource({} as any)).toThrow();
    expect(
      () => new DappRadarProtocolDatasource({ key: '66' } as any),
    ).toThrow();
    expect(
      () => new DappRadarProtocolDatasource({ key: '66', endpoint: [] } as any),
    ).toThrow();
    expect(
      () => new DappRadarProtocolDatasource({ key: [], endpoint: '42' } as any),
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
    mockAxios.get
      .mockImplementationOnce(() => ({
        data: {
          results: [],
          page: 1,
          pageCount: 2,
        },
      }))
      .mockImplementationOnce(() => ({
        data: {
          results: [],
          page: 2,
          pageCount: 2,
        },
      }));

    await dataSource.getItems({ chain: 'smth' });

    expect(mockAxios.get).toHaveBeenCalledTimes(2);
    expect(mockAxios.get).toHaveBeenCalledWith('/defi/dapps', {
      params: {
        page: 1,
        resultsPerPage: 50,
        chain: 'smth',
      },
    });
    expect(mockAxios.get).toHaveBeenCalledWith('/defi/dapps', {
      params: {
        page: 2,
        resultsPerPage: 50,
        chain: 'smth',
      },
    });
  });

  it('should aggregate items correctly', async () => {
    mockAxios.get
      .mockImplementationOnce(() => ({
        data: {
          results: [
            {
              dappId: '1',
              name: 'n1',
              logo: 'l1',
              tvl: 1,
              marketCap: 10,
            },
            {
              dappId: '2',
              name: 'n2',
              logo: 'l2',
              tvl: 2,
              marketCap: 20,
            },
          ],
          page: 1,
          pageCount: 2,
        },
      }))
      .mockImplementationOnce(() => ({
        data: {
          results: [
            {
              dappId: '3',
              name: 'n3',
              logo: 'l3',
              tvl: 3,
              marketCap: 30,
            },
          ],
          page: 2,
          pageCount: 2,
        },
      }));

    await expect(dataSource.getItems({ chain: 'smth' })).resolves.toEqual({
      items: [
        {
          entity: 'protocol',
          metrics: {
            marketCap: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: { usd: 10 },
              },
            ],
            tvl: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: { usd: 1 },
              },
            ],
          },
          id: '1',
          meta: {
            logoUrl: 'l1',
            name: 'n1',
          },
          metrics: {
            marketCap: {
              usd: 10,
            },
            tvl: {
              usd: 1,
            },
          },
        },
        {
          entity: 'protocol',
          metrics: {
            marketCap: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: { usd: 20 },
              },
            ],
            tvl: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: { usd: 2 },
              },
            ],
          },
          id: '2',
          meta: {
            logoUrl: 'l2',
            name: 'n2',
          },
          metrics: {
            marketCap: {
              usd: 20,
            },
            tvl: {
              usd: 2,
            },
          },
        },
        {
          entity: 'protocol',
          metrics: {
            marketCap: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: { usd: 30 },
              },
            ],
            tvl: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: { usd: 3 },
              },
            ],
          },
          id: '3',
          meta: {
            logoUrl: 'l3',
            name: 'n3',
          },
          metrics: {
            marketCap: {
              usd: 30,
            },
            tvl: {
              usd: 3,
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
