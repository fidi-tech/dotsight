import { ChainParams } from './const';

export const TRANSACTIONS_COUNT = (
  { dataset }: ChainParams,
  daysAgo: number,
) => `
  SELECT
    TIMESTAMP_TRUNC(block_timestamp, DAY) as day,
    count(*)
  FROM \`${dataset}.transactions\`
  WHERE
    TIMESTAMP_TRUNC(block_timestamp, DAY) > TIMESTAMP_TRUNC(TIMESTAMP_SUB(CURRENT_TIMESTAMP, INTERVAL ${
      daysAgo + 1
    } DAY), DAY)
  GROUP BY 
    day
  ORDER BY 
    day DESC
`;

export const BLOCKS_COUNT = ({ dataset }: ChainParams, daysAgo: number) => `
  SELECT
    TIMESTAMP_TRUNC(block_timestamp, DAY) as day,
    count(*)
  FROM \`${dataset}.blocks\`
  WHERE
    TIMESTAMP_TRUNC(block_timestamp, DAY) > TIMESTAMP_TRUNC(TIMESTAMP_SUB(CURRENT_TIMESTAMP, INTERVAL ${
      daysAgo + 1
    } DAY), DAY)
  GROUP BY 
    day
  ORDER BY 
    day DESC
`;
