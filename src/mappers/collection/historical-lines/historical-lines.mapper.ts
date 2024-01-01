import { AbstractMapper } from '../../abstract.mapper';
import {
  HistoricalLinesDatashape,
  TYPE,
} from '../../../datashapes/historical-lines.datashape';
import { Entity } from '../../../entities/entity';
import { ENTITIES, FIELDS } from '../../../entities/const';

type Config = {
  entity: string;
  nameField: string;
  valueField: string;
};

type Params = Record<string, never>;

const NAME_DESCRIPTION = "Entity's meta field, e.g. symbol for walletToken";
const VALUE_DESCRIPTION = "Entity's value field, e.g. value for walletToken";

export class HistoricalLinesMapper extends AbstractMapper<
  Config,
  Params,
  any,
  HistoricalLinesDatashape
> {
  static getName(): string {
    return 'Historical Lines';
  }

  static getDescription(): string {
    return `Mapper that converts an array of specified entities with historical metrics to lines that can be plotted.`;
  }

  static getType(): string {
    return 'historical-lines';
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'HistoricalLinesMapper configuration',
      type: 'object',
      properties: {
        entity: {
          description: 'Entity to be processed, e.g. walletToken',
          enum: Object.keys(FIELDS),
        },
      },
      required: ['entity'],
      dependencies: {
        entity: {
          oneOf: ENTITIES.map((entity) => ({
            properties: {
              entity: {
                enum: [entity],
              },
              nameField: {
                enum: FIELDS[entity].meta,
                description: NAME_DESCRIPTION,
              },
              valueField: {
                enum: FIELDS[entity].metrics,
                description: VALUE_DESCRIPTION,
              },
            },
            required: ['nameField', 'valueField'],
          })),
        },
      },
    };
  }

  public static getParamsSchema(): object {
    return {
      title: 'Params',
      description: 'HistoricalLinesMapper params',
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

  map(
    allItems: Record<string, Entity<any, any, any>[]>,
  ): HistoricalLinesDatashape {
    const items = allItems[this.config.entity].map((item) => ({
      id: item.id,
      name: item.meta[this.config.nameField],
      value: item.historicalMetrics[this.config.valueField],
    }));

    return {
      items,
    };
  }
}
