import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SetSubcategoriesDto {
  @ApiProperty({
    description: 'selected subcategories',
    isArray: true,
  })
  @IsString({ each: true })
  readonly subcategories: string[];
}
