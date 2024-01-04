import { HistoricalLinesMapper } from './historical-lines.mapper';

describe('HistoricalLinesMapper', () => {
  it('should have a type of "historical-lines"', () => {
    expect(HistoricalLinesMapper.getType()).toEqual('historical-lines');
  });

  it('should throw if config is incorrect', () => {
    expect(() => new HistoricalLinesMapper({} as any)).toThrow();
    expect(
      () => new HistoricalLinesMapper({ nameField: '1' } as any),
    ).toThrow();
    expect(
      () =>
        new HistoricalLinesMapper({ nameField: '1', valueField: '2' } as any),
    ).toThrow();
  });

  it('should be instantiated if config is correct', () => {
    expect(
      new HistoricalLinesMapper({
        nameField: 'symbol',
        valueField: 'price',
        entity: 'token',
      }),
    ).toBeInstanceOf(HistoricalLinesMapper);
  });

  it('should return entities from config', () => {
    const mapper = new HistoricalLinesMapper({
      nameField: 'symbol',
      valueField: 'price',
      entity: 'token',
    });

    expect(mapper.getRequiredEntities()).toEqual(['token']);
  });

  it('should map the items according to config', () => {
    const mapper = new HistoricalLinesMapper({
      nameField: 'symbol',
      valueField: 'price',
      entity: 'token',
    });
    expect(
      mapper.map({
        token: [
          {
            id: 1,
            meta: { symbol: 'm' },
            historicalMetrics: {
              price: [
                { timestamp: 1, value: 50 },
                { timestamp: 2, value: 51 },
              ],
            },
          } as any,
          {
            id: 2,
            meta: { symbol: 'n' },
            historicalMetrics: {
              price: [
                { timestamp: 1, value: 60 },
                { timestamp: 3, value: 61 },
              ],
            },
          } as any,
        ],
        smthElse: [
          {
            id: 3,
            meta: { 1: 'mm' },
            historicalMetrics: {
              2: [
                { timestamp: 1, value: 250 },
                { timestamp: 2, value: 251 },
              ],
            },
          } as any,
          {
            id: 4,
            meta: { 1: 'nn' },
            historicalMetrics: {
              2: [
                { timestamp: 1, value: 350 },
                { timestamp: 2, value: 351 },
              ],
            },
          } as any,
        ],
      }),
    ).toEqual({
      items: [
        {
          id: 1,
          name: 'm',
          value: [
            {
              timestamp: 1,
              value: 50,
            },
            {
              timestamp: 2,
              value: 51,
            },
          ],
        },
        {
          id: 2,
          name: 'n',
          value: [
            {
              timestamp: 1,
              value: 60,
            },
            {
              timestamp: 3,
              value: 61,
            },
          ],
        },
      ],
    });
  });
});
