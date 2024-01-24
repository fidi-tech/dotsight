import { AbstractMapper } from '../../abstract.mapper';
import {
  Stat,
  StatisticsDatashape,
  TYPE,
} from '../../../datashapes/statistics.datashape';
import {
  PERCENTAGE_CHANGE_SUFFIX,
  Protocol,
  ENTITY,
} from '../../../entities/protocol.entity';

type Config = Record<string, never>;

type Params = {
  dappId: number,
};

class DappStatisticsMapperDappNotFound extends Error {}

export class StatisticsMapper extends AbstractMapper<
  Config,
  Params,
  any,
  StatisticsDatashape
> {
  static getName(): string {
    return 'Dapp Statistics';
  }

  static getDescription(): string {
    return `Mapper that converts an array of specified values to statistics`;
  }

  static getType(): string {
    return 'dapp-statistics';
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'DappStatisticsMapper configuration',
      type: 'object',
      properties: {},
      required: [],
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
      required: ['dappId'],
    };
  }

  static getDatashape(): string {
    return TYPE;
  }

  getRequiredEntities(): string[] {
    return [ENTITY];
  }

  map(data: { protocol: Protocol[] }, {dappId}): StatisticsDatashape {
    const dApp = data.protocol.find(p => p.id.toString() === dappId);
    if (!dApp) {
      throw new DappStatisticsMapperDappNotFound(dappId);
    }
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
