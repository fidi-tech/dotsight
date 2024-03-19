import { IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetWidgetsDto {
  @ApiProperty({
    description: 'text query',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly query?: string;

  @ApiProperty({
    description: 'how many widgets should be returned',
    required: false,
  })
  @IsPositive()
  @IsOptional()
  readonly limit?: number;

  @ApiProperty({
    description: 'how many widgets should be skipped',
    required: false,
  })
  @Min(0)
  @IsOptional()
  readonly offset?: number;
}
