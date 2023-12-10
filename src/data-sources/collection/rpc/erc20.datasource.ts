import { Contract, Web3 } from 'web3';
import {
  AbstractWalletTokenDataSource,
  WalletTokenMeta,
} from '../../abstract.wallet-token.data-source';
import { EVM_ADDRESS, URL_REGEXP } from '../../../common/regexp';
import { WalletToken } from '../../../entities/wallet-token.entity';
import { abi } from './erc20.abi.json';

type Config = {
  rpcUrl: string;
  contractAddress: string;
};

type Params = {
  walletIds: string[];
};

export class Erc20Datasource extends AbstractWalletTokenDataSource<
  Config,
  Params
> {
  private contract: Contract<any>;

  private isInited: boolean;
  private tokenName: string;
  private tokenSymbol: string;
  private tokenDecimals: number;

  constructor(config: Config) {
    super(config);

    const web3 = new Web3(config.rpcUrl);
    this.contract = new web3.eth.Contract(abi, config.contractAddress);
  }

  public static getName(): string {
    return `RPC ERC20`;
  }

  public static getDescription(): string {
    return `Data source that emits the amounts of the ERC20 tokens in the wallets provided`;
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'Erc20Datasource configuration',
      type: 'object',
      properties: {
        rpcUrl: {
          description: 'Url of the RPC endpoint',
          type: 'string',
          pattern: URL_REGEXP,
        },
        contractAddress: {
          description: 'ERC20 contract address',
          type: 'string',
          pattern: EVM_ADDRESS,
        },
      },
      required: ['rpcUrl', 'contractAddress'],
    };
  }

  private async init() {
    if (this.isInited) {
      return;
    }

    [this.tokenName, this.tokenDecimals, this.tokenSymbol] = await Promise.all([
      this.contract.methods.name().call().then(String),
      this.contract.methods.decimals().call().then(Number),
      this.contract.methods.symbol().call().then(String),
    ]);

    this.isInited = true;
  }

  private async getWalletBalance(walletId: string): Promise<number> {
    const amount: number = await this.contract.methods
      .balanceOf(
        // @ts-expect-error bad web3 typings
        walletId,
      )
      .call();
    return Number(amount) / 10 ** this.tokenDecimals;
  }

  async getItems({
    walletIds,
  }: Params): Promise<{ items: WalletToken[]; meta: WalletTokenMeta }> {
    await this.init();

    const items = await Promise.all(
      walletIds.map(async (walletId) => {
        const amount = await this.getWalletBalance(walletId);
        return {
          id: `${walletId}-${this.config.contractAddress}`,
          entity: 'walletToken' as const,
          meta: {
            id: this.config.contractAddress,
            walletId,
            symbol: this.tokenSymbol,
            name: this.tokenName,
          },
          historicalMetrics: {
            amount: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: amount,
              },
            ],
          },
          metrics: {
            amount,
          },
        };
      }),
    );

    return {
      items,
      meta: {
        protocols: {},
        chains: {},
        units: {},
      },
    };
  }

  public static getParamsSchema(): object {
    return {
      title: 'Params',
      description: 'Erc20Datasource params',
      type: 'object',
      properties: {
        walletIds: {
          description: 'Wallets',
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['walletIds'],
    };
  }
}
