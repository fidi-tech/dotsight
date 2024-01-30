import { CategoryId } from '../../common/categories/abstract.category';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateWidgetDto {
  @ApiProperty({
    description: 'selected category',
  })
  @IsString()
  readonly category: CategoryId;

  @ApiProperty({
    description: "widget's name",
    nullable: true,
  })
  @IsString()
  readonly name?: string;
}
