import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetSubcategoriesDto {
  @ApiProperty({
    description: 'text query',
    required: false,
  })
  @IsString()
  readonly query?: string;
}
