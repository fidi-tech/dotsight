import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  HISTORICAL_SCOPE,
  HistoricalScope,
} from '../../data-sources/abstract.data-source';

export class ExecuteParamsDto {
  @ApiProperty({
    description: 'historical scope for the data',
    required: false,
    enum: HISTORICAL_SCOPE,
  })
  @IsEnum(HISTORICAL_SCOPE)
  @IsOptional()
  readonly historicalScope?: HistoricalScope;
}
