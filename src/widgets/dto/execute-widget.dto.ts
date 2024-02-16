import { Metric, MetricId } from '../../common/categories/abstract.category';
import { Unit, UnitId } from '../../data-sources/abstract.data-source';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

type ItemId = string;

export class Item {
  @ApiProperty({
    description: 'item id',
  })
  id: ItemId;

  @ApiProperty({
    description: 'item name',
  })
  name: string;

  @ApiProperty({
    description: 'item icon',
    nullable: true,
  })
  icon: string | null;
}

@ApiExtraModels(Item)
@ApiExtraModels(Metric)
@ApiExtraModels(Unit)
export class ExecuteWidgetDto {
  @ApiProperty({
    description: 'items for which metrics were calculated',
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(Item) },
  })
  items: Record<ItemId, Item>;
  @ApiProperty({
    description: "metrics' metadata",
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(Metric) },
  })
  metrics: Record<MetricId, Metric>;
  @ApiProperty({
    description: 'units of measure that were used in the response',
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(Unit) },
  })
  units: Record<UnitId, Unit>;
  @ApiProperty({
    description: 'calculated data',
    type: 'object',
    properties: {
      items: {
        description: "items' ids",
        type: 'array',
        items: {
          type: 'string',
        },
      },
      metrics: {
        description: "metrics' ids",
        type: 'array',
        items: {
          type: 'string',
        },
      },
      values: {
        type: 'object',
        example: {
          item1id: {
            metric1id: [
              {
                timestamp: 1,
                value: 42,
              },
            ],
            metric2id: [
              {
                timestamp: 2,
                value: { USD: 2 },
              },
            ],
          },
        },
        additionalProperties: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'number',
                },
                value: {
                  oneOf: [
                    { type: 'number' },
                    {
                      type: 'object',
                      additionalProperties: { type: 'number' },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  })
  data: {
    items: ItemId[];
    metrics: MetricId[];
    values: Record<
      ItemId,
      Record<
        MetricId,
        Array<{
          timestamp: number;
          value: number | Record<UnitId, number>;
        }>
      >
    >;
  };
}
