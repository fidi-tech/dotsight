import { UnitId } from '../entities/entity';

export const TYPE = 'distribution';

export type DistributionDatashape = {
  items: Array<{
    id: string;
    name: string;
    iconUrl?: string;
    value: number | Record<UnitId, number>;
  }>;
};
