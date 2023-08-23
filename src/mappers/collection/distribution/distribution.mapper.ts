import { Entity } from '../../../entities/entity';
import { DistributionDatashape } from '../../../datashapes/distribution.datashape';
import { AbstractMapper } from '../../abstract.mapper';

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
  constructor(config: Config) {
    super(config);
    if (!config.nameField) {
      throw new Error('DistributionMapper: config.nameField was not specified');
    }
    if (!config.valueField) {
      throw new Error(
        'DistributionMapper: config.valueField was not specified',
      );
    }
    if (!config.entity) {
      throw new Error('DistributionMapper: config.entity was not specified');
    }
  }

  static getType(): string {
    return 'distribution';
  }

  map(
    allItems: Record<string, Entity<any, any, any>[]>,
  ): DistributionDatashape {
    console.log(allItems);
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
