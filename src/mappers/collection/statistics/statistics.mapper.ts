import { AbstractMapper } from '../../abstract.mapper';
import {
  Stat,
  StatisticsDatashape,
  TYPE,
} from '../../../datashapes/statistics.datashape';
import { ENTITIES } from '../../../entities/const';
import { DApp } from '../../../entities/dapp.entity';

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
          enum: ENTITIES,
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
      properties: {
        dappId: {
          description: 'DappId from DappRadar',
          type: 'integer',
        },
      },
      required: [],
    };
  }

  static getDatashape(): string {
    return TYPE;
  }

  getRequiredEntities(): string[] {
    return [this.config.entity];
  }

  map(data: { dapp: Array<DApp> }): StatisticsDatashape {
    const dApp = data.dapp[0];
    return {
      stats: Object.entries(dApp.metrics).reduce(
        (
          acc,
          [key, value]: [string, { value: number; percentageChange: number }],
        ) => {
          acc.push({
            stat: key,
            value: value.value,
            change: value.percentageChange,
          });
          return acc;
        },
        [] as Array<Stat>,
      ),
      name: dApp.meta.name,
      logoUrl: dApp.meta.logoUrl,
    };
  }
}
