import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './services/categories.service';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { CategoryDto } from './dto/category.dto';

@Controller('categories')
@ApiExtraModels(CategoryDto)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('/')
  @ApiOkResponse({
    description: 'returns a list of the widgets available to the user',
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            $ref: getSchemaPath(CategoryDto),
          },
        },
      },
      required: ['categories'],
    },
  })
  async getCategories() {
    return {
      categories: await this.categoriesService.getCategories(),
    };
  }
}
