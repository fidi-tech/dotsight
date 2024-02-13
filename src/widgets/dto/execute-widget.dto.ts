import { Metric, MetricId } from '../../common/categories/abstract.category';
import { Unit, UnitId } from '../../data-sources/abstract.data-source';

type ItemId = string;

class Item {
  id: ItemId;
  name: string;
  icon: string | null;
}

// TODO api spec
export class ExecuteWidgetDto {
  items: Record<ItemId, Item>;
  metrics: Record<MetricId, Metric>;
  units: Record<UnitId, Unit>;
  data: {
    items: ItemId[];
    metrics: MetricId[];
    values: Record<
      ItemId,
      Record<
        MetricId,
        Array<{
          timestamp: number;
          value: number | Record<UnitId, number>;
        }>
      >
    >;
  };
}
