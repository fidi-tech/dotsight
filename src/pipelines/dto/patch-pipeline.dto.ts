import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PatchPipelineDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly name?: string;
}
