import { ApiProperty } from '@nestjs/swagger';

export type CategoryId = string;
export type SubcategoryId = string;
export type Subcategory = {
  id: SubcategoryId;
  name: string;
  icon: string | null;
};
export type MetricId = string;
export class Metric {
  @ApiProperty({
    description: 'metric id',
  })
  id: MetricId;

  @ApiProperty({
    description: 'metric name',
  })
  name: string;

  @ApiProperty({
    description: 'metric icon',
    nullable: true,
  })
  icon: string | null;
}
export type Metrics = Record<MetricId, Metric>;

export type PresetId = string;
export type Preset = {
  id: PresetId;
  name: string;
  icon: string | null;
  metrics: Metrics;
};
export type Presets = Record<PresetId, Preset>;

export abstract class AbstractCategory<M extends Metrics, P extends Presets> {
  protected constructor(private metrics: M, private presets: P) {}

  abstract getId(): CategoryId;
  abstract validateSubcategory(
    subcategoryId: SubcategoryId,
  ): Promise<Subcategory | null>;
  abstract getName(): string;
  abstract getIcon(): string | null;
  abstract getSubcategoriesByQuery(
    query?: string,
  ): Promise<readonly Subcategory[]>;

  async getMetricsByQuery(query?: string): Promise<Metric[]> {
    const metrics = Object.values(this.metrics) as Array<M[keyof M]>;
    if (!query) {
      return metrics;
    }
    return metrics.filter(
      (metric) =>
        metric.name.toLowerCase().includes(query.toLowerCase()) ||
        metric.id.toLowerCase().includes(query.toLowerCase()),
    );
  }

  async getPresetsByQuery(query?: string): Promise<Preset[]> {
    const presets = Object.values(this.presets) as Array<P[keyof P]>;
    if (!query) {
      return presets;
    }
    return presets.filter(
      (preset) =>
        preset.name.toLowerCase().includes(query.toLowerCase()) ||
        preset.id.toLowerCase().includes(query.toLowerCase()),
    );
  }

  abstract getMetricsByPreset(presetId: PresetId): P[string]['metrics'] | null;
}
