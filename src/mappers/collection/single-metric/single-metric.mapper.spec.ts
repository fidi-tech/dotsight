import { SingleMetricMapper } from './single-metric.mapper';

describe('SingleMetricMapper', () => {
  it('should have a type of "single-metric"', () => {
    expect(SingleMetricMapper.getType()).toEqual('single-metric');
  });

  it('should throw if config is incorrect', () => {
    expect(() => new SingleMetricMapper({} as any)).toThrow();
    expect(() => new SingleMetricMapper({ valueField: '1' } as any)).toThrow();
    expect(
      () =>
        new SingleMetricMapper({ aggregation: 'any', valueField: '2' } as any),
    ).toThrow();
    expect(
      () =>
        new SingleMetricMapper({
          aggregation: 'unknown',
          valueField: '2',
          entity: 'walletToken',
        } as any),
    ).toThrow();
  });

  it('should be instantiated if config is correct', () => {
    expect(
      new SingleMetricMapper({
        aggregation: 'any',
        valueField: 'amount',
        entity: 'walletToken',
      }),
    ).toBeInstanceOf(SingleMetricMapper);
  });

  it('should return entities from config', () => {
    const mapper = new SingleMetricMapper({
      aggregation: 'any',
      valueField: 'amount',
      entity: 'walletToken',
    });

    expect(mapper.getRequiredEntities()).toEqual(['walletToken']);
  });

  it('should map the items according to config', () => {
    const mapper = new SingleMetricMapper({
      aggregation: 'avg',
      valueField: 'amount',
      entity: 'walletToken',
    });
    expect(
      mapper.map({
        walletToken: [
          { id: 1, meta: { 1: 'm' }, metrics: { amount: 50 } } as any,
          { id: 2, meta: { 1: 'n' }, metrics: { amount: 150 } } as any,
        ],
        smthElse: [
          { id: 3, meta: { 1: 'mm' }, metrics: { amount: 250 } } as any,
          { id: 4, meta: { 1: 'nn' }, metrics: { amount: 350 } } as any,
        ],
      }),
    ).toEqual({
      value: 100,
    });

    expect(
      mapper.map({
        walletToken: [
          {
            id: 1,
            meta: { 1: 'm' },
            metrics: { amount: { USD: 50, BTC: 1 } },
          } as any,
          {
            id: 2,
            meta: { 1: 'n' },
            metrics: { amount: { USD: 150, BTC: 2 } },
          } as any,
        ],
        smthElse: [
          {
            id: 3,
            meta: { 1: 'mm' },
            metrics: { amount: { USD: 1050, BTC: 20 } },
          } as any,
          {
            id: 4,
            meta: { 1: 'nn' },
            metrics: { amount: { USD: 1150, BTC: 21 } },
          } as any,
        ],
      }),
    ).toEqual({
      value: { USD: 100, BTC: 1.5 },
    });
  });
});
