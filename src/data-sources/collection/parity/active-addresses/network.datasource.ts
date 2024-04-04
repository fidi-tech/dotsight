import { AbstractNetworkDataSource } from '../../../abstract.network.data-source';
import { Entity, Meta, Params } from '../../../abstract.data-source';
import { metrics as networkMetrics } from '../../../../common/categories/collection/network/metrics';
import { networks as networksList } from '../../../../common/categories/collection/network/networks';
import {
  Metrics,
  Presets,
} from '../../../../common/categories/collection/network/network.category';
import * as fs from 'fs';
import {
  MetricId,
  PresetId,
  SubcategoryId,
} from '../../../../common/categories/abstract.category';
import { parse } from '../../../../common/csv';

// eslint-disable-next-line
type Config = {};

const MAPPING: Partial<Record<keyof Metrics, string>> = {
  monthlyActiveAddresses: 'number_of_active_addresses',
} as const;
export class ParityActiveAddressesNetworkDatasource extends AbstractNetworkDataSource<Config> {
  private static data: Array<Record<string, string>> = parse(
    fs.readFileSync(__dirname + '/active-addresses.csv', {
      encoding: 'utf-8',
    }),
  );

  public getCopyright(): { id: string; name: string; icon: string | null } {
    return {
      id: 'parity',
      name: 'Parity',
      icon: null,
    };
  }

  async getItems({ subcategories }: Params<typeof networkMetrics>): Promise<{
    items: Entity<Metrics, Presets>[];
    meta: Meta;
  }> {
    const networks =
      ParityActiveAddressesNetworkDatasource.getSubcategories(subcategories);

    const items: Entity<Metrics, Presets>[] = [];
    for (const network of networks) {
      const pieces = ParityActiveAddressesNetworkDatasource.data
        .filter(({ chain }) => chain === network)
        .sort(({ month: monthA }, { month: monthB }) =>
          monthB.localeCompare(monthA),
        );
      if (pieces.length > 0) {
        const networkMetadata = networksList.find(({ id }) => id === network);

        const networkMetrics: (typeof items)[0]['metrics'] = {};
        for (const piece of pieces) {
          for (const metric of Object.keys(MAPPING)) {
            if (!networkMetrics[metric]) {
              networkMetrics[metric] = [];
            }
            const date = new Date(piece.month);
            date.setMonth(date.getMonth() + 1);
            date.setSeconds(date.getSeconds() - 1);
            networkMetrics[metric].push({
              timestamp: date.getTime() / 1000,
              value: +piece[MAPPING[metric]],
            });
          }
        }

        items.push({
          id: network,
          name: networkMetadata?.name ?? network,
          icon: networkMetadata?.icon ?? null,
          metrics: networkMetrics,
        });
      }
    }

    return {
      items,
      meta: {
        units: {},
      },
    };
  }

  static getSubcategories(subcategories: SubcategoryId[]) {
    return subcategories.filter((chain) =>
      ParityActiveAddressesNetworkDatasource.data.find(
        (piece) => piece.chain === chain,
      ),
    );
  }

  static getMetrics(metrics: MetricId[]): MetricId[] {
    return Object.keys(MAPPING).filter((metricId) =>
      metrics.includes(metricId),
    );
  }

  public static hasPreset(preset: PresetId): boolean {
    return false;
  }
}
