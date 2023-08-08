import {ValueType, ValueMeta} from './common';

type TimeStamp = number;

export type TimelineDataShape = {
  type: ValueType,
  meta?: ValueMeta,
  data: Record<TimeStamp, number>,
}