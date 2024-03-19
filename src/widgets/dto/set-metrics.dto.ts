import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SetMetricsDto {
  @ApiProperty({
    description: 'selected metrics',
    isArray: true,
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  readonly metrics?: string[];

  @ApiProperty({
    description: 'selected preset',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly preset?: string;
}
