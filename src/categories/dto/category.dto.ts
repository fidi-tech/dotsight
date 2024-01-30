import { CategoryId } from '../../common/categories/abstract.category';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @ApiProperty({
    description: "category's uuid",
  })
  readonly id: CategoryId;

  @ApiProperty({
    description: "category's name",
  })
  readonly name: string;

  @ApiProperty({
    description: "category's icon url",
    nullable: true,
  })
  readonly icon: string | null;
}
