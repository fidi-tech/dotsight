import {Value} from './common';

type ColumnId = string;
type RowId = string;

type RowData = {
  id: RowId,
  data: Record<ColumnId, Value>,
};

export type TableDataShape = Array<RowData>;