export type CategoryId = string;
export type SubcategoryId = string;
export type Subcategory = {
  id: SubcategoryId;
  name: string;
  icon: string | null;
};
export type MetricId = string;
export type Metric = {
  id: MetricId;
  name: string;
  icon: string | null;
};
export type Metrics = Record<MetricId, Metric>;

export abstract class AbstractCategory<M extends Metrics> {
  protected constructor(private metrics: M) {}

  abstract getId(): CategoryId;
  abstract validateSubcategory(
    subcategoryId: SubcategoryId,
  ): Promise<Subcategory | null>;
  abstract getName(): string;
  abstract getIcon(): string | null;
  abstract getSubcategoriesByQuery(
    query?: string,
  ): Promise<readonly Subcategory[]>;

  async getMetricsByQuery(query?: string): Promise<Array<M[keyof M]>> {
    return Object.values(this.metrics).filter((metric) =>
      metric.name.includes(query),
    ) as Array<M[keyof M]>;
  }
}
