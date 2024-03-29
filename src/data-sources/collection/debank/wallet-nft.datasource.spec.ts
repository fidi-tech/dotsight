import axios, { AxiosHeaders, AxiosInstance } from 'axios';

import { DebankWalletNFTDatasource } from './wallet-nft.datasource';

jest.useFakeTimers();
jest.mock('../../../common/http');

describe('DebankWalletNFTDatasource', () => {
  let axiosCreate;
  let dataSource: DebankWalletNFTDatasource;

  const mockAxios = {
    get: jest.fn(),
  };
  beforeEach(() => {
    axiosCreate = jest.spyOn(axios, 'create');
    axiosCreate.mockImplementation(() => mockAxios as any as AxiosInstance);

    dataSource = new DebankWalletNFTDatasource({
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
    expect(mockAxios.get).toHaveBeenCalledWith('/user/all_nft_list', {
      params: {
        id: 'w1',
      },
    });
    expect(mockAxios.get).toHaveBeenCalledWith('/user/all_nft_list', {
      params: {
        id: 'w2',
      },
    });
  });

  it('should normalize items correctly', async () => {
    mockAxios.get
      .mockImplementationOnce(() => ({
        data: [
          {
            id: 'nid1',
            contract_id: 'cid1',
            chain: 'chain1',
            name: 'name1',
            content_type: 'ct1',
            content: 'c1',
            thumbnail_url: 't1',
            detail_url: 'd1',
            contract_name: 'cname1',
            pay_token: {
              amount: 1,
            },
          },
          {
            id: 'nid2',
            contract_id: 'cid2',
            chain: 'chain2',
            name: 'name2',
            content_type: 'ct2',
            content: 'c2',
            detail_url: 'd2',
            contract_name: 'cname2',
          },
        ],
      }))
      .mockImplementationOnce(() => ({
        data: [
          {
            id: 'nid3',
            contract_id: 'cid3',
            chain: 'chain3',
            name: 'name3',
            content_type: 'ct3',
            content: 'c3',
            thumbnail_url: 't3',
            detail_url: 'd3',
            contract_name: 'cname3',
            pay_token: {
              amount: 3,
            },
          },
        ],
      }));

    await expect(
      dataSource.getItems({ subcategories: ['w1', 'w2'] }),
    ).resolves.toEqual({
      items: [
        {
          id: 'cid1-nid1',
          icon: 't1',
          name: 'name1',
          metrics: {
            price: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: {
                  usd: 1,
                },
              },
            ],
          },
        },
        {
          metrics: {
            price: [],
          },
          id: 'cid2-nid2',
          icon: undefined,
          name: 'name2',
        },
        {
          metrics: {
            price: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: {
                  usd: 3,
                },
              },
            ],
          },
          id: 'cid3-nid3',
          icon: 't3',
          name: 'name3',
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
