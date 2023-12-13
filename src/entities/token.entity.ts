import { Entity, UnitId } from './entity';

type Meta = {
  id: string;
  symbol?: string;
  iconUrl?: string;
  name?: string;
};

type Metrics = {
  price?: Record<UnitId, number>;
};

export const META: Array<keyof Meta> = ['symbol', 'name'];

export const METRICS: Array<keyof Metrics> = ['price'];

export type Token = Entity<'token', Meta, Metrics>;
