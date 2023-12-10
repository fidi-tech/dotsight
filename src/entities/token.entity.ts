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

export type Token = Entity<'token', Meta, Metrics>;
