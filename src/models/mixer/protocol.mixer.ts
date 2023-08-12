import { Mixer } from './mixer';
import { Protocol } from '../../common/protocol';

export type ProtocolMixerConfig = Record<string, never>;

export class ProtocolMixer extends Mixer<ProtocolMixerConfig, Protocol> {}
