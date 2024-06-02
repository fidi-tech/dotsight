import { BigQueryPublicDataChainDatasource } from './network.datasource';

const createQueryJob = jest.fn();
jest.mock('@google-cloud/bigquery', () => ({
  BigQuery: class BigQuery {
    createQueryJob = createQueryJob;
  },
}));

describe('BigQueryPublicDataChainDatasource', () => {
  const datasource: BigQueryPublicDataChainDatasource =
    new BigQueryPublicDataChainDatasource(1, {} as any);

  it('should return correct data', async () => {
    createQueryJob.mockImplementation(() => [
      {
        getQueryResults: async () => [
          [
            {
              day: { value: 1000 },
              f0_: 123,
            },
            {
              day: { value: 2000 },
              f0_: 321,
            },
          ],
        ],
      },
    ]);

    const result = await datasource.getItems({
      subcategories: ['ethereum', 'avalanche'],
    });
    expect(result).toEqual({
      items: [
        {
          icon: null,
          metrics: {
            dailyAverageBlockTime: [
              {
                timestamp: 1,
                value: 123,
              },
              {
                timestamp: 2,
                value: 321,
              },
            ],
            dailyBlocksCount: [
              {
                timestamp: 1,
                value: 123,
              },
              {
                timestamp: 2,
                value: 321,
              },
            ],
            dailyTransactionsCount: [
              {
                timestamp: 1,
                value: 123,
              },
              {
                timestamp: 2,
                value: 321,
              },
            ],
          },
          id: 'ethereum',
          name: 'Ethereum',
        },
        {
          icon: null,
          metrics: {
            dailyAverageBlockTime: [
              {
                timestamp: 1,
                value: 123,
              },
              {
                timestamp: 2,
                value: 321,
              },
            ],
            dailyBlocksCount: [
              {
                timestamp: 1,
                value: 123,
              },
              {
                timestamp: 2,
                value: 321,
              },
            ],
            dailyTransactionsCount: [
              {
                timestamp: 1,
                value: 123,
              },
              {
                timestamp: 2,
                value: 321,
              },
            ],
          },
          id: 'avalanche',
          name: 'Avalanche',
        },
      ],
      meta: {
        units: {},
      },
    });
  });
});
