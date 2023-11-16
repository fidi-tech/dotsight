import { DistributionMapper } from './distribution.mapper';

describe('DistributionMapper', () => {
  it('should have a type of "distribution"', () => {
    expect(DistributionMapper.getType()).toEqual('distribution');
  });

  it('should throw if config is incorrect', () => {
    expect(() => new DistributionMapper({} as any)).toThrow();
    expect(() => new DistributionMapper({ nameField: '1' } as any)).toThrow();
    expect(
      () => new DistributionMapper({ nameField: '1', valueField: '2' } as any),
    ).toThrow();
  });

  it('should be instantiated if config is correct', () => {
    expect(
      new DistributionMapper({
        nameField: '1',
        valueField: '2',
        entity: 'walletToken',
      }),
    ).toBeInstanceOf(DistributionMapper);
  });

  it('should map the items according to config', () => {
    const mapper = new DistributionMapper({
      nameField: '1',
      valueField: '2',
      entity: 'wallet',
    });
    expect(
      mapper.map({
        wallet: [
          { id: 1, meta: { 1: 'm' }, metrics: { 2: 50 } } as any,
          { id: 2, meta: { 1: 'n' }, metrics: { 2: 150 } } as any,
        ],
        smthElse: [
          { id: 3, meta: { 1: 'mm' }, metrics: { 2: 250 } } as any,
          { id: 4, meta: { 1: 'nn' }, metrics: { 2: 350 } } as any,
        ],
      }),
    ).toEqual({
      items: [
        {
          id: 1,
          name: 'm',
          value: 50,
        },
        {
          id: 2,
          name: 'n',
          value: 150,
        },
      ],
    });
  });

  it('should return entities from config', () => {
    const mapper = new DistributionMapper({
      nameField: '1',
      valueField: '2',
      entity: 'wallet',
    });

    expect(mapper.getRequiredEntities()).toEqual(['wallet']);
  });
});
