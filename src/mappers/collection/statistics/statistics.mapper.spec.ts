import { StatisticsMapper } from './statistics.mapper';

describe('StatisticsMapper', () => {
  it('should have a type of "statistics"', () => {
    expect(StatisticsMapper.getType()).toEqual('statistics');
  });

  it('should throw if config is incorrect', () => {
    expect(() => new StatisticsMapper({} as any)).toThrow();
    expect(
      () =>
        new StatisticsMapper({
          entity: 'walletToken',
        } as any),
    ).toThrow();
  });

  it('should be instantiated if config is correct', () => {
    expect(
      new StatisticsMapper({
        entity: 'protocol',
      }),
    ).toBeInstanceOf(StatisticsMapper);
  });

  it('should return entities from config', () => {
    const mapper = new StatisticsMapper({
      entity: 'protocol',
    });

    expect(mapper.getRequiredEntities()).toEqual(['protocol']);
  });

  it('should map the items according to config', () => {
    const mapper = new StatisticsMapper({
      entity: 'protocol',
    });
    expect(
      mapper.map({
        protocol: [
          {
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
      }),
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
});
