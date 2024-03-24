import { ChainlinkTokenDataSource } from '../token.datasource';
import { config } from './config';
import { SubcategoryId } from '../../../../common/categories/abstract.category';

export class EthereumChainlinkTokenDataSource extends ChainlinkTokenDataSource {
  getConfig(): Record<
    string,
    { id: string; symbol: string; name: string; address: string }
  > {
    return config;
  }

  static getSubcategories(subcategories: SubcategoryId[]): SubcategoryId[] {
    return subcategories.filter((tokenId) => config[tokenId]);
  }
}
