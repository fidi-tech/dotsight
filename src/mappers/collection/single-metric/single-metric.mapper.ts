import { AbstractMapper } from '../../abstract.mapper';
import { TYPE } from '../../../datashapes/single-metric.datashape';
import { Entity } from '../../../entities/entity';
import { add, div } from '../../../common/math';
import { ENTITIES } from '../../../entities/const';

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
  static getType(): string {
    return 'single-metric';
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'SingleMetricMapper configuration',
      type: 'object',
      properties: {
        aggregation: {
          description:
            'Select a way to aggregate several entities to a single value',
          enum: ['any', 'sum', 'avg'],
        },
        valueField: {
          description: "Entity's value field, e.g. value for walletToken",
          type: 'string',
          minLength: 1,
        },
        entity: {
          description: 'Entity to be processed, e.g. walletToken',
          enum: ENTITIES,
        },
      },
      required: ['aggregation', 'valueField', 'entity'],
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
