import { Meta } from '../entities/wallet-nft.entity';

export const TYPE = 'nft-list';

export type NFTListDatashape = {
  items: Array<Meta>;
};
