export type DataSourceId = string;

export class DataSource {
  id: DataSourceId;
  type: string;
  config: object;
}
