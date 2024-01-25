import { StatisticsMapper } from './statistics.mapper';

describe('DappStatisticsMapper', () => {
  it('should have a type of "statistics"', () => {
    expect(StatisticsMapper.getType()).toEqual('dapp-statistics');
  });

  it('should be instantiated if config is correct', () => {
    expect(
      new StatisticsMapper({}),
    ).toBeInstanceOf(StatisticsMapper);
  });

  it('should return entities from config', () => {
    const mapper = new StatisticsMapper({});

    expect(mapper.getRequiredEntities()).toEqual(['protocol']);
  });

  it('should map the items according to config', () => {
    const mapper = new StatisticsMapper({});
    expect(
      mapper.map({
        protocol: [
          {
            id: 'id1',
            meta: { name: 'Name', logoUrl: 'LogoUrl' },
            metrics: {
              key1: 1,
              key1PercentageChange: 3,
              key2: 2,
              key3: { USD: 5 },
              key3PercentageChange: 4,
            },
          } as any,
        ],
      }, {dappId: 'id1'}),
    ).toEqual({
      stats: [
        {
          stat: 'key1',
          value: 1,
          change: 3,
        },
        {
          stat: 'key2',
          value: 2,
        },
        {
          stat: 'key3',
          value: {
            USD: 5,
          },
          change: 4,
        },
      ],
      name: 'Name',
      logoUrl: 'LogoUrl',
    });
  });

  it('should throw an error if dapp not found', () => {
    const mapper = new StatisticsMapper({});
    expect(
      () => mapper.map({
        protocol: [
          {
            id: 'id1',
            meta: { name: 'Name', logoUrl: 'LogoUrl' },
            metrics: {
              key1: 1,
              key1PercentageChange: 3,
              key2: 2,
              key3: { USD: 5 },
              key3PercentageChange: 4,
            },
          } as any,
        ],
      }, {dappId: 'id2'}),
    ).toThrow();
  })
});
