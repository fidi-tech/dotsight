import { AbstractMapper } from '../../abstract.mapper';
import {
  Stat,
  StatisticsDatashape,
  TYPE,
} from '../../../datashapes/statistics.datashape';
import {
  PERCENTAGE_CHANGE_SUFFIX,
  Protocol,
} from '../../../entities/protocol.entity';

type Config = {
  entity: string;
};

type Params = Record<string, never>;

export class StatisticsMapper extends AbstractMapper<
  Config,
  Params,
  any,
  StatisticsDatashape
> {
  static getName(): string {
    return 'Statistics';
  }

  static getDescription(): string {
    return `Mapper that converts an array of specified values to statistics`;
  }

  static getType(): string {
    return 'statistics';
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'StatisticsMapper configuration',
      type: 'object',
      properties: {
        entity: {
          description: 'Entity to be processed, e.g. walletToken',
          enum: ['protocol'],
        },
      },
      required: ['entity'],
    };
  }

  public static getParamsSchema(): object {
    return {
      title: 'Params',
      description: 'StatisticsMapper params',
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

  map(data: { protocol: Protocol[] }): StatisticsDatashape {
    const dApp = data.protocol[0];
    const metrics = dApp.metrics;
    const keys = Object.keys(metrics).filter(
      (key) => !key.includes(PERCENTAGE_CHANGE_SUFFIX),
    );
    return {
      stats: keys.reduce((acc, key) => {
        const value = {
          stat: key,
          value: metrics[key],
        } as Stat;
        if (metrics[`${key}${PERCENTAGE_CHANGE_SUFFIX}`]) {
          value.change = metrics[`${key}${PERCENTAGE_CHANGE_SUFFIX}`];
        }
        acc.push(value);
        return acc;
      }, [] as Array<Stat>),
      name: dApp.meta.name,
      logoUrl: dApp.meta.logoUrl,
    };
  }
}
