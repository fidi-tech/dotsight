import { Mixer } from './mixer';
import { Wallet } from '../../common/wallet';

export type WalletMixerConfig = Record<string, never>;

export class WalletMixer extends Mixer<WalletMixerConfig, Wallet> {}
