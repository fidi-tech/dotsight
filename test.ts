// TODO remove this before merging

import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery();

const QUERY = `
  SELECT
    TIMESTAMP_TRUNC(block_timestamp, DAY) as day,
    count(*)
  FROM \`bigquery-public-data.goog_blockchain_ethereum_mainnet_us.accounts_state\`
  WHERE
    TIMESTAMP_TRUNC(block_timestamp, DAY) > TIMESTAMP("2024-01-01")
    AND balance > 0
  GROUP BY 
    day
  ORDER BY 
    day DESC
`;

(async () => {
  const options = {
    query: QUERY,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
  };

  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  // Print the results
  console.log('Rows:');
  rows.forEach((row, ...rest) => console.log(row, rest));
})().catch(console.error);
