import { CurrencyId, Entity } from './_common';

type Meta = {
  protocolId: string;
  walletId: string;
};

type HistoricalMetrics = Record<string, never>;

type Metrics = {
  tokens: Record<CurrencyId, number>;
};

export type WalletProtocol = Entity<Meta, HistoricalMetrics, Metrics>;
