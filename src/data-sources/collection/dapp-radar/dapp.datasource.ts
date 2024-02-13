// import { BadRequestException } from '@nestjs/common';
// import axios, { AxiosHeaders, AxiosInstance } from 'axios';
//
// import {
//   Protocol,
//   METRICS,
//   PERCENTAGE_CHANGE_SUFFIX,
// } from '../../../entities/protocol.entity';
// import { Units } from '../../../entities/entity';
// import { USD } from '../../../common/currecies';
// import { Meta } from '../../abstract.data-source';
// import { addLogging } from '../../../common/http';
// import { URL_REGEXP } from '../../../common/regexp';
// import { AbstractProtocolDataSource } from '../../abstract.protocol.data-source';
//
// type Config = {
//   key: string;
//   endpoint: string;
// };
//
// const RANGES = ['24h', '7d', '30d'];
// type Range = (typeof RANGES)[number];
//
// type Params = {
//   dappId: number;
//   range: Range;
// };
//
// type DappRadarApp = {
//   dappId: number;
//   name: string;
//   logo: string | null;
//   chains: string[];
//   metrics: Record<string, number>;
// };
//
// const scalarMetrics = ['transactions', 'uaw'];
//
// export class DappRadarDappDatasource extends AbstractProtocolDataSource<
//   Config,
//   Params
// > {
//   private httpClient: AxiosInstance;
//
//   public static getName(): string {
//     return `DappRadar DApp information`;
//   }
//
//   public static getDescription(): string {
//     return `Data source powered by DappRadar API that returns users, transactions, volume, balance for a specific DApp, powered by DappRadar API. Consult https://api-docs.dappradar.com/#operation/getDappItem for more info.`;
//   }
//
//   constructor(config: Config) {
//     super(config);
//
//     this.httpClient = axios.create({
//       baseURL: this.config.endpoint,
//       headers: new AxiosHeaders({
//         'X-BLOBR-KEY': this.config.key,
//       }),
//     });
//
//     addLogging('DappRadarDappDatasource', this.httpClient);
//   }
//
//   public async getItems({ dappId, range }: Params): Promise<{
//     items: Protocol[];
//     meta: Meta;
//   }> {
//     if (!RANGES.includes(range)) {
//       throw new BadRequestException(
//         `Wrong range param. ${RANGES.join('|')} are available`,
//       );
//     }
//     const items: Protocol[] = [];
//     const units: Units = {
//       [USD.id]: USD,
//     };
//
//     const response = await this.fetchDApp({ dappId, range });
//     const dApp = response.data.results;
//     items.push({
//       id: dApp.dappId.toString(),
//       entity: 'protocol',
//       meta: {
//         name: dApp.name,
//         logoUrl: dApp.logo,
//       },
//       metrics: METRICS.reduce((acc, metric) => {
//         if (
//           dApp.metrics[metric] !== null &&
//           dApp.metrics[metric] !== undefined
//         ) {
//           const value = scalarMetrics.includes(metric)
//             ? dApp.metrics[metric]
//             : { [USD.id]: dApp.metrics[metric] };
//           acc[metric] = [
//             {
//               timestamp: Math.floor(Date.now() / 1000),
//               value,
//             },
//           ];
//         }
//         return acc;
//       }, {}),
//     });
//
//     return {
//       items,
//       meta: {
//         units,
//       },
//     };
//   }
//
//   private fetchDApp({ dappId, range }: { dappId: number; range?: Range }) {
//     return this.httpClient.get<{
//       results: DappRadarApp;
//       page: number;
//       pageCount: number;
//     }>(`/dapps/${dappId}`, {
//       params: {
//         range,
//       },
//     });
//   }
// }
