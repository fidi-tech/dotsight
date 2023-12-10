import { AbstractMapper } from '../../abstract.mapper';
import { TYPE } from '../../../datashapes/single-metric.datashape';
import { Entity } from '../../../entities/entity';
import { add, div } from '../../../common/math';
import { ENTITIES, FIELDS } from '../../../entities/const';

type Config = {
  entity: string;
  valueField: string;
  aggregation: 'any' | 'sum' | 'avg';
};

type Params = Record<string, never>;

export class SingleMetricMapper extends AbstractMapper<
  Config,
  Params,
  any,
  any
> {
  static getName(): string {
    return 'Single value';
  }

  static getDescription(): string {
    return `Mapper that converts an array of specified entities to a single value. Array is reduced to this single value by the provided aggregation function`;
  }

  static getType(): string {
    return 'single-metric';
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'SingleMetricMapper configuration',
      type: 'object',
      properties: {
        entity: {
          description: 'Entity to be processed, e.g. walletToken',
          enum: ENTITIES,
        },
        aggregation: {
          description:
            'Select a way to aggregate several entities to a single value',
          enum: ['any', 'sum', 'avg'],
        },
      },
      required: ['aggregation', 'entity'],
      dependencies: {
        entity: {
          oneOf: ENTITIES.map((entity) => ({
            properties: {
              entity: {
                enum: [entity],
              },
              valueField: {
                description: "Entity's value field, e.g. value for walletToken",
                enum: FIELDS[entity].metrics,
              },
            },
            required: ['valueField'],
          })),
        },
      },
    };
  }

  public static getParamsSchema(): object {
    return {
      title: 'Params',
      description: 'DistributionMapper params',
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

  map(allItems: Record<string, Entity<any, any, any>[]>): any {
    if (allItems[this.config.entity].length === 0) {
      return { value: 0 };
    }

    const items = allItems[this.config.entity].map(
      (item) => item.metrics[this.config.valueField],
    );

    switch (this.config.aggregation) {
      case 'avg':
        return { value: div(add(...items), items.length) };
      case 'sum':
        return { value: add(...items) };
      case 'any':
      default:
        return { value: items[0] };
    }
  }
}
