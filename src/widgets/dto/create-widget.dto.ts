import { CategoryId } from '../../categories/abstract.category';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString } from 'class-validator';

export class CreateWidgetDto {
  @ApiProperty({
    description: 'selected category',
  })
  @IsUUID()
  readonly category: CategoryId;

  @ApiProperty({
    description: "widget's name",
    nullable: true,
  })
  @IsString()
  readonly name?: string;
}
