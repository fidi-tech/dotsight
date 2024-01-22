import { Entity } from './entity';

export const ENTITY = 'chain';

type Meta = {
  name: string;
};

type Metrics = {
  dailyTransactionsCount?: number;
  dailyBlocksCount?: number;
};

export const META: Array<keyof Meta> = ['name'];

export const METRICS: Array<keyof Metrics> = [
  'dailyTransactionsCount',
  'dailyBlocksCount',
];

export type Chain = Entity<'chain', Meta, Metrics>;
