import { DistributionMapper } from './distribution/distribution.mapper';

export const collection = {
  [DistributionMapper.getType()]: DistributionMapper,
} as const;
