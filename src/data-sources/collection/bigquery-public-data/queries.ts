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

export const BLOCK_PRODUCTION_RATE = (
  { dataset }: ChainParams,
  daysAgo: number,
) => `
  SELECT
    TIMESTAMP_TRUNC(block_timestamp, DAY) as day,
    AVG(datetime_diff(block_timestamp, prev_block_timestamp, SECOND)) as average_block_time_sec
  FROM (
    SELECT
        *,
        LAG(block_timestamp, 1) OVER(ORDER BY block_timestamp ASC) AS prev_block_timestamp
    FROM \`${dataset}.blocks\`
    WHERE
        TIMESTAMP_TRUNC(block_timestamp, DAY) > TIMESTAMP_TRUNC(TIMESTAMP_SUB(CURRENT_TIMESTAMP, INTERVAL ${
          daysAgo + 1
        } DAY), DAY)
  )
  GROUP BY 
    day
  ORDER BY 
    day DESC
`;
