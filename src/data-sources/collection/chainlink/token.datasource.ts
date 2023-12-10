import { AbstractTokenDataSource } from '../../abstract.token.data-source';
import { config } from './config';
import { Token } from '../../../entities/token.entity';
import { Meta } from '../../abstract.data-source';
import { Contract, Web3 } from 'web3';
import { abi } from './abi';
import { USD } from '../../../common/currecies';
import { URL_REGEXP } from '../../../common/regexp';

type Config = {
  token: keyof typeof config;
  rpc: string;
};

type Params = Record<string, never>;

const fractionDigits = 4;

export class ChainlinkTokenDataSource extends AbstractTokenDataSource<
  Config,
  Params
> {
  private contract: Contract<any>;
  private token: (typeof config)[keyof typeof config];

  public static getName(): string {
    return `Chainlink API`;
  }

  public static getDescription(): string {
    return `Data source powered by Chainlink API that returns the price for the token. Consult https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&categories=verified for more info.`;
  }

  public static getConfigSchema(): object {
    return {
      title: 'Config',
      description: 'ChainlinkTokenDataSource configuration',
      type: 'object',
      properties: {
        rpc: {
          description: 'Url of the ethereum RPC endpoint',
          type: 'string',
          pattern: URL_REGEXP,
        },
        token: {
          description: 'Choose token',
          enum: Object.keys(config),
        },
      },
      required: ['rpc', 'token'],
    };
  }

  constructor(c: Config) {
    super(c);

    this.token = config[c.token];

    const web3 = new Web3(c.rpc);
    this.contract = new web3.eth.Contract(abi, this.token.address);
  }

  async getItems(): Promise<{ items: Token[]; meta: Meta }> {
    // @ts-expect-error bad typings
    const [decimals, { answer }] = await Promise.all([
      this.contract.methods.decimals().call(),
      this.contract.methods.latestRoundData().call(),
    ]);

    const price =
      Number(
        (BigInt(answer) * 10n ** BigInt(fractionDigits)) /
          10n ** BigInt(decimals as any as number),
      ) /
      10 ** fractionDigits;

    return {
      items: [
        {
          id: this.token.id,
          entity: 'token',
          meta: {
            id: this.token.id,
            symbol: this.token.symbol,
            name: this.token.name,
          },
          metrics: {
            price: {
              [USD.id]: price,
            },
          },
          historicalMetrics: {
            price: [
              {
                timestamp: Math.floor(Date.now() / 1000),
                value: { [USD.id]: price },
              },
            ],
          },
        },
      ],
      meta: {
        units: {
          [USD.id]: USD,
        },
      },
    };
  }
}
