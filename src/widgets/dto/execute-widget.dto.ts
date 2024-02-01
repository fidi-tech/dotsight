import { Metric, MetricId } from '../../common/categories/abstract.category';
import { UnitId, Unit } from '../../entities/entity';

type ItemId = string;

class Item {
  id: ItemId;
  name: string;
  icon: string | null;
}

// TODO move Unit
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
          value: Record<UnitId, number>;
        }>
      >
    >;
  };
}
