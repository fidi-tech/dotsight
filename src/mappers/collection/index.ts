import { DistributionMapper } from './distribution/distribution.mapper';
import { SingleMetricMapper } from './single-metric/single-metric.mapper';
import { HistoricalLinesMapper } from './historical-lines/historical-lines.mapper';

export const collection = {
  [DistributionMapper.getType()]: DistributionMapper,
  [SingleMetricMapper.getType()]: SingleMetricMapper,
  [HistoricalLinesMapper.getType()]: HistoricalLinesMapper,
} as const;

// checking if required static methods are implemented
for (const mapper of Object.values(collection)) {
  mapper.getName();
  mapper.getDescription();
  mapper.getType();
  mapper.getConfigSchema();
  mapper.getDatashape();
  mapper.getParamsSchema();
}
