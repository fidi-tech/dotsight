import debankPipelineConfig from './debank.pipeline.config';
import polkadotPipelineConfig from './polkadot.pipeline.config';
import examplePipelineConfig from './example.pipeline.config';

const pipelines = [];

if (process.env.DEBANK_API_KEY) {
  pipelines.push(debankPipelineConfig);
}
pipelines.push(polkadotPipelineConfig);
pipelines.push(examplePipelineConfig);

export default {
  pipelines,
} as const;
