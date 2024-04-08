import { AbstractTokenDataSource } from '../../abstract.token.data-source';
import {
  Entity,
  HISTORICAL_SCOPE,
  HistoricalScope,
  Meta,
  Params,
} from '../../abstract.data-source';
import { Contract, Web3 } from 'web3';
import { abi } from './abi';
import { USD } from '../../../common/currecies';
import { metrics } from '../../../common/categories/collection/token/metrics';
import {
  MetricId,
  PresetId,
  SubcategoryId,
} from '../../../common/categories/abstract.category';

type Config = {
  rpc: string;
};

const fractionDigits = 4;
class ChainlinkGetSubcategoriesNotSpecifiedError extends Error {}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

export abstract class ChainlinkTokenDataSource extends AbstractTokenDataSource<Config> {
  private web3: Web3;

  abstract getConfig(): Record<
    string,
    { id: string; symbol: string; name: string; address: string }
  >;

  public getCopyright(): { id: string; name: string; icon: string | null } {
    return {
      id: 'chainlink',
      name: 'Chainlink',
      icon: null,
    };
  }

  public static getName(): string {
    return `Chainlink API`;
  }

  public static getDescription(): string {
    return `Data source powered by Chainlink API that returns the price for the token. Consult https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&categories=verified for more info.`;
  }

  constructor(c: Config) {
    super(c);

    this.web3 = new Web3(c.rpc);
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

  private async getCurrentState(contract: Contract<any>) {
    const [
      decimals,
      // @ts-expect-error bad typings
      { roundId: lastRoundId, updatedAt, answer },
    ] = await Promise.all([
      contract.methods.decimals().call(),
      contract.methods.latestRoundData().call(),
    ]);

    return {
      answer,
      decimals: decimals as any as number,
      lastRoundId,
      lastUpdatedAt: new Date(Number(updatedAt) * 1000),
    };
  }

  async getTokenData(
    token: string,
    historicalScope: HistoricalScope = HISTORICAL_SCOPE.MONTH,
  ) {
    const contract = new this.web3.eth.Contract(
      abi,
      this.getConfig()[token].address,
    );

    const { decimals, lastRoundId, lastUpdatedAt, answer } =
      await this.getCurrentState(contract);
    const { phaseId, aggregatorRoundId: lastAggregatorRoundId } =
      this.fromRoundIdToAggregatorRoundId(BigInt(lastRoundId));

    const historical = new Map<number, number>([
      [
        Math.floor(lastUpdatedAt.getTime() / 1000),
        this.convertPrice(answer, decimals),
      ],
    ]);

    let aggregatorRoundId = lastAggregatorRoundId - 1n;
    let step: bigint | null = null;
    let shouldRequestMore = Boolean(historicalScope);
    let previousUpdatedAt: null | number = null;

    while (shouldRequestMore) {
      const roundId = this.fromAggregatorRoundIfToRoundId(
        phaseId,
        aggregatorRoundId,
      );
      const response = await contract.methods.getRoundData(roundId).call();
      const timestamp = Number(response.updatedAt) * 1000;

      historical.set(
        Math.floor(timestamp / 1000),
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
          if ((step! * 4n) / 5n !== 0n) {
            aggregatorRoundId += step!;
            step = (step! * 4n) / 5n;
          }
        } else {
          // if everything is ok, we can go faster, and take bigger steps
          // without this, we might go too slow after several rewinds
          step = (step! * 4n) / 3n;
          previousUpdatedAt = timestamp;
        }
      }

      aggregatorRoundId -= step!;

      if (historicalScope === HISTORICAL_SCOPE.DAY) {
        shouldRequestMore = lastUpdatedAt.getTime() - timestamp < DAY;
      } else if (historicalScope === HISTORICAL_SCOPE.MONTH) {
        shouldRequestMore = lastUpdatedAt.getTime() - timestamp < MONTH;
      }
    }

    return {
      id: this.getConfig()[token].id,
      name: this.getConfig()[token].name,
      icon: null,

      metrics: {
        price: Array.from(historical.entries())
          .sort(([dateA], [dateB]) => dateA - dateB)
          .map(([date, price]) => ({
            timestamp: date,
            value: { [USD.id]: price },
          })),
      },
    };
  }

  async getItems({
    subcategories,
    historicalScope,
  }: Params<typeof metrics>): Promise<{
    // eslint-disable-next-line
    items: Entity<typeof metrics, {}>[];
    meta: Meta;
  }> {
    const tokenIds = (
      this.constructor as typeof ChainlinkTokenDataSource
    ).getSubcategories(subcategories);
    const data = await Promise.all(
      tokenIds.map((tokenId) => this.getTokenData(tokenId, historicalScope)),
    );

    return {
      items: data,
      meta: {
        units: {
          [USD.id]: USD,
        },
      },
    };
  }

  static getSubcategories(subcategories: SubcategoryId[]): SubcategoryId[] {
    throw new ChainlinkGetSubcategoriesNotSpecifiedError();
  }

  static getMetrics(metrics: MetricId[]): MetricId[] {
    return ['price'].filter((metricId) => metrics.includes(metricId));
  }

  public static hasPreset(preset: PresetId): boolean {
    return false;
  }
}
