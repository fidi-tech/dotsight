import debankPipelineConfig from './debank.pipeline.config';
import polkadotPipelineConfig from './polkadot.pipeline.config';

const pipelines = [];

if (process.env.DEBANK_API_KEY) {
  pipelines.push(debankPipelineConfig);
}
pipelines.push(polkadotPipelineConfig);

export default {
  pipelines,
} as const;
