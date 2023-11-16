import { UnitId } from '../entities/entity';

export const TYPE = 'single-metric';

export type SingleMetricDatashape = {
  value: number | Record<UnitId, number>;
};
