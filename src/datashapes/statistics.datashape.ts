import { UnitId } from '../entities/entity';

export const TYPE = 'statistics';

export type Stat = {
  stat: string;
  value: number | Record<UnitId, number>;
  change?: number;
};

export type StatisticsDatashape = {
  name: string;
  logoUrl: string;
  stats: Array<Stat>;
};
