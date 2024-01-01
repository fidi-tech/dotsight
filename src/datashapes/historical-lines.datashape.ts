import { TimeSeries, UnitId } from '../entities/entity';

export const TYPE = 'historical-lines';

export type HistoricalLinesDatashape = {
  items: Array<{
    name: string;
    value: TimeSeries<number | Record<UnitId, number>>;
  }>;
};
