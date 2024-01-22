import { AbstractTokenDataSource } from '../../abstract.token.data-source';
import { config } from './config';
import { Token, ENTITY } from '../../../entities/token.entity';
import { Meta } from '../../abstract.data-source';
import { Contract, Web3 } from 'web3';
import { abi } from './abi';
import { USD } from '../../../common/currecies';
import { URL_REGEXP } from '../../../common/regexp';

const HISTORICAL_SCOPE = {
  DAY: 'day',
  MONTH: 'month',
} as const;

type Config = {
  token: keyof typeof config;
  rpc: string;
};

type Params = {
  historicalScope?: (typeof HISTORICAL_SCOPE)[keyof typeof HISTORICAL_SCOPE];
};

const fractionDigits = 4;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

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
          default: 'https://rpc.ankr.com/eth',
        },
        token: {
          description: 'Choose token',
          enum: Object.keys(config),
        },
      },
      required: ['rpc', 'token'],
    };
  }

  public static getParamsSchema(): object {
    return {
      title: 'Params',
      description: 'ChainlinkTokenDataSource params',
      type: 'object',
      properties: {
        historicalScope: {
          description: "How long metrics' history should be",
          enum: Object.values(HISTORICAL_SCOPE),
        },
      },
      required: [],
    };
  }

  constructor(c: Config) {
    super(c);

    this.token = config[c.token];

    const web3 = new Web3(c.rpc);
    this.contract = new web3.eth.Contract(abi, this.token.address);
  }

  private convertPrice(answer, decimals) {
    return (
      Number(
        (BigInt(answer) * 10n ** BigInt(fractionDigits)) /
          10n ** BigInt(decimals as any as number),
      ) /
      10 ** fractionDigits
    );
  }

  private fromRoundIdToAggregatorRoundId(roundId: bigint) {
    const phaseId = roundId >> 64n;
    const aggregatorRoundId = roundId & BigInt('0xFFFFFFFFFFFFFFFF');

    return { phaseId, aggregatorRoundId };
  }

  private fromAggregatorRoundIfToRoundId(
    phaseId: bigint,
    aggregatorRoundId: bigint,
  ) {
    return (phaseId << 64n) | aggregatorRoundId;
  }

  private async getCurrentState() {
    const [
      decimals,
      // @ts-expect-error bad typings
      { roundId: lastRoundId, updatedAt, answer },
    ] = await Promise.all([
      this.contract.methods.decimals().call(),
      this.contract.methods.latestRoundData().call(),
    ]);

    return {
      answer,
      decimals: decimals as any as number,
      lastRoundId,
      lastUpdatedAt: new Date(Number(updatedAt) * 1000),
    };
  }

  async getItems({
    historicalScope,
  }: Params): Promise<{ items: Token[]; meta: Meta }> {
    const { decimals, lastRoundId, lastUpdatedAt, answer } =
      await this.getCurrentState();
    const { phaseId, aggregatorRoundId: lastAggregatorRoundId } =
      this.fromRoundIdToAggregatorRoundId(BigInt(lastRoundId));

    const historical = new Map<number, number>([
      [
        Math.floor(lastUpdatedAt.getTime() / 1000),
        this.convertPrice(answer, decimals),
      ],
    ]);

    let aggregatorRoundId = lastAggregatorRoundId - 1n;
    let step = null;
    let shouldRequestMore = Boolean(historicalScope);
    let previousUpdatedAt = null;

    while (shouldRequestMore) {
      const roundId = this.fromAggregatorRoundIfToRoundId(
        phaseId,
        aggregatorRoundId,
      );
      // @ts-expect-error bad typings
      const response = await this.contract.methods.getRoundData(roundId).call();
      // @ts-expect-error bad typings
      const timestamp = Number(response.updatedAt) * 1000;

      historical.set(
        Math.floor(timestamp / 1000),
        // @ts-expect-error bad typings
        this.convertPrice(response.answer, decimals),
      );

      if (!previousUpdatedAt) {
        // initial step guess
        const interval = lastUpdatedAt.getTime() - timestamp;
        if (historicalScope === HISTORICAL_SCOPE.DAY) {
          step = BigInt(Math.round((24 * HOUR) / interval / 12));
        } else if (historicalScope === HISTORICAL_SCOPE.MONTH) {
          step = BigInt(Math.round((30 * DAY) / interval / 15));
        }

        previousUpdatedAt = timestamp;
      } else {
        // checking if went too far in the past
        let needRewind = false;

        if (historicalScope === HISTORICAL_SCOPE.DAY) {
          if (previousUpdatedAt - timestamp > 3 * HOUR) {
            needRewind = true;
          }
        } else if (historicalScope === HISTORICAL_SCOPE.MONTH) {
          if (previousUpdatedAt - timestamp > 3 * DAY) {
            needRewind = true;
          }
        }

        if (needRewind) {
          // rewinding back
          // we go back to previous round, and take smaller steps from now on
          if ((step * 4n) / 5n !== 0n) {
            aggregatorRoundId += step;
            step = (step * 4n) / 5n;
          }
        } else {
          // if everything is ok, we can go faster, and take bigger steps
          // without this, we might go too slow after several rewinds
          step = (step * 4n) / 3n;
          previousUpdatedAt = timestamp;
        }
      }

      aggregatorRoundId -= step;

      if (historicalScope === HISTORICAL_SCOPE.DAY) {
        shouldRequestMore = lastUpdatedAt.getTime() - timestamp < DAY;
      } else if (historicalScope === HISTORICAL_SCOPE.MONTH) {
        shouldRequestMore = lastUpdatedAt.getTime() - timestamp < MONTH;
      }
    }

    return {
      items: [
        {
          id: this.token.id,
          entity: ENTITY,
          meta: {
            id: this.token.id,
            symbol: this.token.symbol,
            name: this.token.name,
          },
          metrics: {
            price: {
              [USD.id]: historical.get(
                Math.floor(lastUpdatedAt.getTime() / 1000),
              ),
            },
          },
          historicalMetrics: {
            price: Array.from(historical.entries())
              .sort(([dateA], [dateB]) => dateA - dateB)
              .map(([date, price]) => ({
                timestamp: date,
                value: { [USD.id]: price },
              })),
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
