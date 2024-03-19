import { UnitId } from '../data-sources/abstract.data-source';

export const add = (
  ...vals: Array<number | Record<UnitId, number>>
): number | Record<UnitId, number> => {
  if (vals.length === 0) {
    return 0;
  }
  if (typeof vals[0] === 'number') {
    let result = 0;
    for (const val of vals) {
      if (typeof val !== 'number') {
        throw new Error(`Can not add number to ${typeof val}`);
      }
      result += val;
    }
    return result;
  }

  const result: Record<UnitId, number> = {};
  for (const val of vals) {
    if (typeof val !== 'object') {
      throw new Error(`Can not add currency to ${typeof val}`);
    }
    for (const currencyId of Object.keys(val)) {
      if (!result[currencyId]) {
        result[currencyId] = val[currencyId];
      } else {
        result[currencyId] += val[currencyId];
      }
    }
  }
  return result;
};

export const div = (
  dividend: number | Record<UnitId, number>,
  divisor: number,
) => {
  if (typeof dividend === 'number') {
    return dividend / divisor;
  }
  const result: Record<UnitId, number> = { ...dividend };
  for (const currencyId of Object.keys(result)) {
    result[currencyId] /= divisor;
  }
  return result;
};
