import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetMetricsDto {
  @ApiProperty({
    description: 'text query',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly query?: string;
}
