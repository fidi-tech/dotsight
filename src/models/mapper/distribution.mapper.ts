import { Mapper } from './mapper';
import { UnitId, Entity } from '../../common/entity';
import { GetItemsResult } from '../datasource/datasource';
import { DistributionDatashape } from '../../datashapes/distribution.datashape';

type Params = {
  limit?: number;
  unitId?: UnitId;
};

type Config<NF, VF> = {
  nameField: NF;
  valueField: VF;
};

export class DistributionMapper<E extends Entity<any, any>> extends Mapper<
  Config<keyof E['meta'], keyof E['metrics']>,
  Params,
  E,
  DistributionDatashape
> {
  extractParameters(params: Record<any, any>): Params {
    const result: Params = {};

    if (params.unitId) {
      result.unitId = params.unitId;
    }
    if (params.limit && !Number.isNaN(Number.parseInt(params.limit, 10))) {
      result.limit = Number.parseInt(params.limit, 10);
    }

    return result;
  }

  map(e: GetItemsResult<E>, params): DistributionDatashape {
    const unitId = params.unitId;
    const limit = Number.parseInt(params.limit, 10);

    const items = e.items
      .map((item) => ({
        id: item.id,
        name: item.meta[this.config.nameField],
        value:
          typeof item.metrics[this.config.valueField] === 'number'
            ? item.metrics[this.config.valueField]
            : item.metrics[this.config.valueField][unitId] || 0,
      }))
      .sort(({ value: valueA }, { value: valueB }) => valueB - valueA);

    if (Number.isNaN(limit) || limit < 0) {
      return {
        items,
        restItemsValue: 0,
      };
    }

    return {
      items: items.slice(0, limit),
      restItemsValue: items
        .slice(limit)
        .reduce((acc, { value }) => acc + value, 0),
    };
  }
}
