import { AbstractDataSource, Meta } from './abstract.data-source';
import { WalletNFT } from '../entities/wallet-nft.entity';

export type WalletNFTMeta = Meta;

export abstract class AbstractWalletNFTDataSource<
  C,
  P,
> extends AbstractDataSource<C, P, WalletNFT, WalletNFTMeta> {
  public static getEntity(): string {
    return 'walletNFT';
  }
}
