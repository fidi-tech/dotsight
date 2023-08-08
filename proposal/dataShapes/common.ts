export enum ValueType {
  Percent = 'Percent',
  String = 'String',
  Number = 'Number',
  Currency = 'Currency',
}

type PercentValue = {
  type: ValueType.Percent,
  value: number,
}

type StringValue = {
  type: ValueType.String,
  value: string,
}

type NumberValue = {
  type: ValueType.Number,
  value: number,
}

type CurrencyMeta = {
  symbol: string,
}
type CurrencyValue = {
  type: ValueType.Currency,
  meta: CurrencyMeta,
  amount: number,
}

export type Value = PercentValue | StringValue | NumberValue | CurrencyValue;
export type ValueMeta = CurrencyMeta;
