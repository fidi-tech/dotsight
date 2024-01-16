import { Entity } from './entity';

type Meta = {
  name: string;
};

type Metrics = {
  dailyTransactionsCount?: number;
};

export const META: Array<keyof Meta> = ['name'];

export const METRICS: Array<keyof Metrics> = ['dailyTransactionsCount'];

export type Chain = Entity<'chain', Meta, Metrics>;
