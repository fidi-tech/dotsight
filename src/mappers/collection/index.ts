import { DistributionMapper } from './distribution/distribution.mapper';
import { SingleMetricMapper } from './single-metric/single-metric.mapper';

export const collection = {
  [DistributionMapper.getType()]: DistributionMapper,
  [SingleMetricMapper.getType()]: SingleMetricMapper,
} as const;

// checking if required static methods are implemented
for (const mapper of Object.values(collection)) {
  mapper.getName();
  mapper.getDescription();
  mapper.getType();
  mapper.getConfigSchema();
  mapper.getDatashape();
}
