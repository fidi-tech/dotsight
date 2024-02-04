import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SetMetricsDto {
  @ApiProperty({
    description: 'selected metrics',
    isArray: true,
  })
  @IsString({ each: true })
  readonly metrics: string[];
}
