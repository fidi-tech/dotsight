import { Entity } from '../../../entities/entity';
import {
  DistributionDatashape,
  TYPE,
} from '../../../datashapes/distribution.datashape';
import { AbstractMapper } from '../../abstract.mapper';
import { ENTITIES } from '../../../entities/const';

type Params = Record<string, never>;

type Config = {
  entity: string;
  nameField: string;
  valueField: string;
};

export class DistributionMapper extends AbstractMapper<
  Config,
  Params,
  any,
  DistributionDatashape
> {
  static getName(): string {
    return 'Distribution';
  }

  static getDescription(): string {
    return `Mapper that converts an array of specified entities to name-value pairs. The number of pairs will always be equal to the number of entities provided by data sources.`;
  }

  static getType(): string {
    return 'distribution';
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'DistributionMapper configuration',
      type: 'object',
      properties: {
        entity: {
          description: 'Entity to be processed, e.g. walletToken',
          enum: ENTITIES,
        },
        nameField: {
          description: "Entity's meta field, e.g. symbol for walletToken",
          type: 'string',
          minLength: 1,
        },
        valueField: {
          description: "Entity's value field, e.g. value for walletToken",
          type: 'string',
          minLength: 1,
        },
      },
      required: ['nameField', 'valueField', 'entity'],
    };
  }

  static getDatashape(): string {
    return TYPE;
  }

  map(
    allItems: Record<string, Entity<any, any, any>[]>,
  ): DistributionDatashape {
    const items = allItems[this.config.entity].map((item) => ({
      id: item.id,
      name: item.meta[this.config.nameField],
      value: item.metrics[this.config.valueField],
    }));

    return {
      items,
    };
  }

  getRequiredEntities(): string[] {
    return [this.config.entity];
  }
}
