import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetSubcategoriesDto {
  @ApiProperty({
    description: 'text query',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly query?: string;
}
