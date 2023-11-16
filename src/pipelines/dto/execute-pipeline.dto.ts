import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExecutePipelineDto {
  @ApiProperty({
    description: "specify pipeline's outputs to be executed",
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  readonly mapperCodes?: string[];

  @ApiProperty({
    description:
      "specify pipeline's widgets to be executed. overrides mapperCodes parameter",
    required: false,
  })
  @IsString({ each: true })
  @IsOptional()
  readonly widgetIds?: string[];
}
