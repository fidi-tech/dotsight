import { BigQueryPublicDataChainDatasource } from './chain.datasource';

const createQueryJob = jest.fn();
jest.mock('@google-cloud/bigquery', () => ({
  BigQuery: class BigQuery {
    createQueryJob = createQueryJob;
  },
}));

describe('BigQueryPublicDataChainDatasource', () => {
  const datasource: BigQueryPublicDataChainDatasource =
    new BigQueryPublicDataChainDatasource({} as any);

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

    const result = await datasource.getItems({ chain: 'ethereum' });
    expect(result).toEqual({
      items: [
        {
          entity: 'chain',
          historicalMetrics: {
            dailyBlocksCount: [
              {
                timestamp: 1,
                value: 123,
              },
            ],
            dailyTransactionsCount: [
              {
                timestamp: 1,
                value: 123,
              },
            ],
          },
          id: 'ethereum',
          meta: {
            name: 'Ethereum',
          },
          metrics: {
            dailyBlocksCount: 123,
            dailyTransactionsCount: 123,
          },
        },
      ],
      meta: {
        units: {},
      },
    });
  });
});
