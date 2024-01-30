import { SubcategoryId } from '../../common/categories/abstract.category';
import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryDto {
  @ApiProperty({
    description: "subcategory's uuid",
  })
  readonly id: SubcategoryId;

  @ApiProperty({
    description: "subcategory's name",
  })
  readonly name: string;

  @ApiProperty({
    description: "subcategory's icon",
  })
  readonly icon: string | null;

  @ApiProperty({
    description: 'if subcategory is already selected by the user',
  })
  readonly isSelected: boolean;

  @ApiProperty({
    description: 'if subcategory is available in givenn context',
  })
  readonly isAvailable: boolean;
}
