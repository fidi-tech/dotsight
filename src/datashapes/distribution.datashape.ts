import { UnitId } from '../entities/entity';

export type DistributionDatashape = {
  items: Array<{
    id: string;
    name: string;
    iconUrl?: string;
    value: number | Record<UnitId, number>;
  }>;
};
