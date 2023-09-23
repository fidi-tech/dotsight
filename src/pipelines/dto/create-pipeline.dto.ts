import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePipelineDto {
  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly name?: string;
}
