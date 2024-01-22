import { AbstractMapper } from '../../abstract.mapper';
import { NFTListDatashape, TYPE } from '../../../datashapes/nft-list.datashape';
import { ENTITY } from '../../../entities/wallet-nft.entity';
import { Entity } from '../../../entities/entity';

type Config = Record<string, never>;

type Params = Record<string, never>;

export class NFTListMapper extends AbstractMapper<
  Config,
  Params,
  typeof ENTITY,
  NFTListDatashape
> {
  static getName(): string {
    return 'NFT List';
  }

  static getDescription(): string {
    return `Mapper prepares list of NFT information`;
  }

  static getType(): string {
    return 'nft-list';
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'NFTListMapper configuration',
      type: 'object',
      properties: {},
      required: [],
    };
  }

  public static getParamsSchema(): object {
    return {
      title: 'Params',
      description: 'NFTListMapper params',
      type: 'object',
      properties: {},
      required: [],
    };
  }

  static getDatashape(): string {
    return TYPE;
  }

  getRequiredEntities(): string[] {
    return [ENTITY];
  }

  map(allItems: Record<string, Entity<any, any, any>[]>): NFTListDatashape {
    const items = allItems[ENTITY].map((nft) => nft.meta);
    return {
      items,
    };
  }
}
