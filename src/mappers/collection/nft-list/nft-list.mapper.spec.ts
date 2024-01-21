import { NFTListMapper } from './nft-list.mapper';

describe('NFTListMapper', () => {
  it('should have a type of "nft-list"', () => {
    expect(NFTListMapper.getType()).toEqual('nft-list');
  });

  it('should throw if config is incorrect', () => {
    expect(() => new NFTListMapper({} as any)).toThrow();
  });

  it('should be instantiated if config is correct', () => {
    expect(
      new NFTListMapper({
        entity: 'walletNFT',
      }),
    ).toBeInstanceOf(NFTListMapper);
  });

  it('should return entities from config', () => {
    const mapper = new NFTListMapper({
      entity: 'walletNFT',
    });

    expect(mapper.getRequiredEntities()).toEqual(['walletNFT']);
  });

  it('should map the items according to config', () => {
    const mapper = new NFTListMapper({
      entity: 'walletNFT',
    });
    expect(
      mapper.map({
        walletNFT: [
          {
            meta: { object: 'nft1' },
          } as any,
          {
            meta: { object: 'nft2' },
          } as any,
        ],
      }),
    ).toEqual({
      items: [
        {
          object: 'nft1',
        },
        {
          object: 'nft2',
        },
      ],
    });
  });
});
