import { MetricId } from '../../common/categories/abstract.category';
import { ApiProperty } from '@nestjs/swagger';

export class MetricDto {
  @ApiProperty({
    description: "metric's id",
  })
  readonly id: MetricId;

  @ApiProperty({
    description: "metric's name",
  })
  readonly name: string;

  @ApiProperty({
    description: "metric's icon",
  })
  readonly icon: string | null;

  @ApiProperty({
    description: 'if metric is already selected by the user',
  })
  readonly isSelected: boolean;

  @ApiProperty({
    description: 'if metric is available in the given context',
  })
  readonly isAvailable: boolean;
}
