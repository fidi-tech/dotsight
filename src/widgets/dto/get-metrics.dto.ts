import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetMetricsDto {
  @ApiProperty({
    description: 'text query',
    required: false,
  })
  @IsString()
  readonly query?: string;
}
