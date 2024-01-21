import { AbstractMapper } from '../../abstract.mapper';
import { NFTListDatashape, TYPE } from '../../../datashapes/nft-list.datashape';
import { Entity } from '../../../entities/entity';
import { ENTITIES } from '../../../entities/const';

type Config = {
  entity: string;
};

type Params = Record<string, never>;

export class NFTListMapper extends AbstractMapper<
  Config,
  Params,
  any,
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
      properties: {
        entity: {
          description: 'Entity to be processed, e.g. walletToken',
          enum: ENTITIES,
        },
      },
      required: ['entity'],
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
    return [this.config.entity];
  }

  map(allItems: Record<string, Entity<any, any, any>[]>): NFTListDatashape {
    const items = allItems[this.config.entity].map((nft) => nft.meta);
    return {
      items,
    };
  }
}
