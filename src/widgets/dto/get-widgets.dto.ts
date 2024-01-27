import { IsPositive, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetWidgetsDto {
  @ApiProperty({
    description: 'text query',
    required: false,
  })
  @IsString()
  readonly query?: string;

  @ApiProperty({
    description: 'how many widgets should be returned',
    required: false,
  })
  @IsPositive()
  readonly limit?: number;

  @ApiProperty({
    description: 'how many widgets should be skipped',
    required: false,
  })
  @Min(0)
  readonly offset?: number;
}
