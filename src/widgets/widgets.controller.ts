import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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
import { SubcategoryDto } from './dto/subcategory.dto';
import { GetMetricsDto } from './dto/get-metrics.dto';
import { MetricDto } from './dto/metric.dto';
import { ExecuteWidgetDto } from './dto/execute-widget.dto';
import { ExecuteWidgetService } from './services/widget/execute-widget.service';
import { SetSubcategoriesDto } from './dto/set-subcategories.dto';
import { SetMetricsDto } from './dto/set-metrics.dto';
import { SaveWidgetDto } from './dto/save-widget.dto';
import { ExecuteParamsDto } from './dto/execute-params.dto';
import { JwtOrGuestGuard } from '../auth/guards/jwtOrGuest.guard';

@Controller('widgets')
@ApiExtraModels(Widget)
@ApiExtraModels(SubcategoryDto)
@ApiExtraModels(MetricDto)
@ApiExtraModels(ExecuteWidgetDto)
export class WidgetsController {
  constructor(
    private readonly widgetService: WidgetService,
    private readonly widgetAbilityService: WidgetAbilityService,
    private readonly executeWidgetService: ExecuteWidgetService,
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

  @Get('/:widgetId')
  @ApiOkResponse({
    description: 'returns a widget by id',
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
  @UseGuards(JwtOrGuestGuard)
  async getWidgetById(
    @AuthId() userId: UserId | null,
    @Param('widgetId') widgetId: WidgetId,
  ) {
    await this.widgetAbilityService.claimRead(userId, widgetId);
    return {
      widget: await this.widgetService.findById(widgetId, userId),
    };
  }

  @Patch('/:widgetId')
  @ApiOkResponse({
    description: 'returns updated widget',
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
  async saveWidget(
    @AuthId() userId: UserId,
    @Param('widgetId') widgetId: WidgetId,
    @Body() { name, isPublic, view, viewParameters }: SaveWidgetDto,
  ) {
    await this.widgetAbilityService.claimModify(userId, widgetId);
    await this.widgetService.save(
      userId,
      widgetId,
      name,
      isPublic,
      view,
      viewParameters,
    );
    return {
      widget: await this.widgetService.findById(widgetId, userId),
    };
  }

  @Delete('/:widgetId')
  @ApiOkResponse({
    description: 'widget successfully deleted',
  })
  @UseGuards(JwtGuard)
  async deleteWidget(
    @AuthId() userId: UserId,
    @Param('widgetId') widgetId: WidgetId,
  ) {
    await this.widgetAbilityService.claimDelete(userId, widgetId);
    await this.widgetService.deleteWidget(widgetId);
    return {};
  }

  @Get('/:widgetId/subcategories')
  @ApiOkResponse({
    description:
      "returns a list of the subcategories inside the specified widget's category",
    schema: {
      type: 'object',
      properties: {
        subcategories: {
          type: 'array',
          items: {
            $ref: getSchemaPath(SubcategoryDto),
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
    await this.widgetAbilityService.claimModify(userId, widgetId);
    return {
      subcategories: await this.widgetService.querySubcategories(
        userId,
        widgetId,
        query,
      ),
    };
  }

  @Put('/:widgetId/subcategories')
  @ApiOkResponse({
    description: "sets widget's subcategories",
    schema: {
      type: 'object',
      properties: {
        subcategories: {
          type: 'array',
          items: {
            $ref: getSchemaPath(SubcategoryDto),
          },
        },
        widget: {
          $ref: getSchemaPath(Widget),
        },
      },
      required: ['subcategories', 'widget'],
    },
  })
  @UseGuards(JwtGuard)
  async setSubcategories(
    @AuthId() userId: UserId,
    @Param('widgetId') widgetId: WidgetId,
    @Body() { subcategories: selectedSubcategories }: SetSubcategoriesDto,
    @Query() { query }: GetSubcategoriesDto,
  ) {
    await this.widgetAbilityService.claimModify(userId, widgetId);

    await this.widgetService.setSubcategories(
      userId,
      widgetId,
      selectedSubcategories,
    );

    const [subcategories, widget] = await Promise.all([
      this.widgetService.querySubcategories(userId, widgetId, query),
      this.widgetService.findById(widgetId, userId),
    ]);
    return {
      subcategories,
      widget,
    };
  }

  @Get('/:widgetId/metrics')
  @ApiOkResponse({
    description:
      "returns a list of the metrics inside the specified widget's category",
    schema: {
      type: 'object',
      properties: {
        metrics: {
          type: 'array',
          items: {
            $ref: getSchemaPath(MetricDto),
          },
        },
        presets: {
          type: 'array',
          items: {
            $ref: getSchemaPath(MetricDto),
          },
        },
      },
      required: ['metrics', 'presets'],
    },
  })
  @UseGuards(JwtGuard)
  async getMetrics(
    @AuthId() userId: UserId,
    @Param('widgetId') widgetId: WidgetId,
    @Query() { query }: GetMetricsDto,
  ) {
    await this.widgetAbilityService.claimModify(userId, widgetId);
    return await this.widgetService.queryMetrics(userId, widgetId, query);
  }

  @Put('/:widgetId/metrics')
  @ApiOkResponse({
    description: "sets widget's metrics",
    schema: {
      type: 'object',
      properties: {
        metrics: {
          type: 'array',
          items: {
            $ref: getSchemaPath(MetricDto),
          },
        },
        widget: {
          $ref: getSchemaPath(Widget),
        },
      },
      required: ['metrics', 'widget'],
    },
  })
  @UseGuards(JwtGuard)
  async setMetrics(
    @AuthId() userId: UserId,
    @Param('widgetId') widgetId: WidgetId,
    @Body() { metrics: selectedMetrics, preset }: SetMetricsDto,
    @Query() { query }: GetMetricsDto,
  ) {
    await this.widgetAbilityService.claimModify(userId, widgetId);

    await this.widgetService.setMetrics(
      userId,
      widgetId,
      selectedMetrics,
      preset,
    );

    const [metrics, widget] = await Promise.all([
      this.widgetService.queryMetrics(userId, widgetId, query),
      this.widgetService.findById(widgetId, userId),
    ]);
    return {
      metrics,
      widget,
    };
  }

  @Get('/:widgetId/data')
  @ApiOkResponse({
    description:
      "returns a list of the metrics inside the specified widget's category",
    schema: {
      type: 'object',
      properties: {
        data: {
          $ref: getSchemaPath(ExecuteWidgetDto),
        },
      },
      required: ['data'],
    },
  })
  @UseGuards(JwtOrGuestGuard)
  async getData(
    @AuthId() userId: UserId | null,
    @Param('widgetId') widgetId: WidgetId,
    @Query() params: ExecuteParamsDto,
  ) {
    await this.widgetAbilityService.claimExecute(userId, widgetId);
    return {
      data: await this.executeWidgetService.executeWidget(
        userId,
        widgetId,
        params,
      ),
    };
  }
}
