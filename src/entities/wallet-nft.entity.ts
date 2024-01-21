import { Entity } from './entity';

export type Meta = {
  id: string;
  contractId: string;
  chain: string;
  name: string;
  contentType: string;
  content: string;
  thumbnailUrl: string;
  detailUrl: string;
  contractName: string;
  lastPrice?: number;
};

type Metrics = {
  amount?: number;
};

export const META: Array<keyof Meta> = [
  'id',
  'contractId',
  'chain',
  'name',
  'contentType',
  'content',
  'thumbnailUrl',
  'detailUrl',
  'contractName',
];

export const METRICS: Array<keyof Metrics> = ['amount'];

export type WalletNFT = Entity<'walletNFT', Meta, Metrics>;
