import { CategoryId } from '../../common/categories/abstract.category';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateWidgetDto {
  @ApiProperty({
    description: 'selected category',
  })
  @IsString()
  readonly category: CategoryId;

  @ApiProperty({
    description: "widget's name",
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly name?: string;
}
