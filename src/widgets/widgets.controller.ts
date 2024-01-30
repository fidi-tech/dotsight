import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiCreatedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Widget, WidgetId } from './entities/widget.entity';
import { AuthId } from '../auth/decorators/authId.decorator';
import { UserId } from '../users/entities/user.entity';
import { GetWidgetsDto } from './dto/get-widgets.dto';
import { WidgetService } from './services/widget/widget.service';
import { WidgetAbilityService } from './services/widget-ability/widget-ability.service';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { GetSubcategoriesDto } from './dto/get-subcategories.dto';
import { CategoryDto } from '../categories/dto/category.dto';
import { SubcategoryDto } from './dto/subcategory.dto';

@Controller('widgets')
@ApiExtraModels(Widget)
@ApiExtraModels(SubcategoryDto)
export class WidgetsController {
  constructor(
    private readonly widgetService: WidgetService,
    private readonly widgetAbilityService: WidgetAbilityService,
  ) {}

  @Get('/')
  @ApiOkResponse({
    description: 'returns a list of the widgets available to the user',
    schema: {
      type: 'object',
      properties: {
        widgets: {
          type: 'array',
          items: {
            $ref: getSchemaPath(Widget),
          },
        },
      },
      required: ['widgets'],
    },
  })
  @UseGuards(JwtGuard)
  async getWidgets(
    @AuthId() userId: UserId,
    @Query() { query, limit = 20, offset = 0 }: GetWidgetsDto,
  ) {
    return {
      widgets: await this.widgetService.queryWidgets(
        userId,
        limit,
        offset,
        query,
      ),
    };
  }

  @Post('/')
  @ApiCreatedResponse({
    description: 'returns created widget',
    schema: {
      type: 'object',
      properties: {
        widget: {
          $ref: getSchemaPath(Widget),
        },
      },
      required: ['widget'],
    },
  })
  @UseGuards(JwtGuard)
  async createWidget(
    @AuthId() userId: UserId,
    @Body() { category, name }: CreateWidgetDto,
  ) {
    await this.widgetAbilityService.claimCreate(userId);
    const widget = await this.widgetService.create(userId, category, name);
    return {
      widget: await this.widgetService.findById(widget.id, userId),
    };
  }

  @Get('/:widgetId/subcategories')
  @ApiOkResponse({
    description:
      'returns a list of the subcategories inside the specified category',
    schema: {
      type: 'object',
      properties: {
        subcategories: {
          type: 'array',
          items: {
            $ref: getSchemaPath(CategoryDto),
          },
        },
      },
      required: ['subcategories'],
    },
  })
  @UseGuards(JwtGuard)
  async getSubcategories(
    @AuthId() userId: UserId,
    @Param('widgetId') widgetId: WidgetId,
    @Query() { query }: GetSubcategoriesDto,
  ) {
    return {
      subcategories: await this.widgetService.querySubcategories(
        userId,
        widgetId,
        query,
      ),
    };
  }
}
