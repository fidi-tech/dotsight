import { Test, TestingModule } from '@nestjs/testing';
import { TestDbModule } from '../common/spec/db';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { WidgetsController } from './widgets.controller';
import { WidgetService } from './services/widget/widget.service';
import { Widget } from './entities/widget.entity';
import { WidgetAbilityService } from './services/widget-ability/widget-ability.service';
import { CategoriesService } from '../categories/services/categories.service';
import { DataSourceService } from '../data-sources/services/data-source/data-source.service';
import { ExecuteWidgetService } from './services/widget/execute-widget.service';
import { SubcategoryDto } from './dto/subcategory.dto';
import { MetricDto } from './dto/metric.dto';
import { ExecuteWidgetDto } from './dto/execute-widget.dto';
import { ExecuteParamsDto } from './dto/execute-params.dto';

describe('WidgetsController', () => {
  let controller: WidgetsController;

  let widgetService: WidgetService;
  let widgetAbilityService: WidgetAbilityService;
  let executeWidgetService: ExecuteWidgetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        TypeOrmModule.forFeature([Widget]),
        JwtModule,
        ConfigModule,
      ],
      controllers: [WidgetsController],
      providers: [
        WidgetService,
        WidgetAbilityService,
        CategoriesService,
        DataSourceService,
        ExecuteWidgetService,
      ],
    }).compile();

    controller = module.get<WidgetsController>(WidgetsController);

    widgetService = module.get<WidgetService>(WidgetService);
    widgetAbilityService =
      module.get<WidgetAbilityService>(WidgetAbilityService);
    executeWidgetService =
      module.get<ExecuteWidgetService>(ExecuteWidgetService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWidgets', () => {
    it('should call the widgetService with the proper params', async () => {
      const userId = '101';
      const query = 'query';
      const limit = 10;
      const offset = 1;

      const widgets = 42 as any as Widget[];
      jest.spyOn(widgetService, 'queryWidgets').mockResolvedValue(widgets);

      await expect(
        controller.getWidgets(userId, { query, limit, offset }),
      ).resolves.toEqual({ widgets });

      expect(widgetService.queryWidgets).toHaveBeenCalledTimes(1);
      expect(widgetService.queryWidgets).toHaveBeenCalledWith(
        userId,
        limit,
        offset,
        query,
      );
    });
  });

  describe('createWidget', () => {
    it('should check access and call the widgetService with the proper params', async () => {
      const userId = '101';
      const category = 'category';
      const name = 'name';

      jest.spyOn(widgetAbilityService, 'claimCreate').mockResolvedValue();
      jest
        .spyOn(widgetService, 'create')
        .mockResolvedValue({ id: '66' } as any as Widget);
      const widget = 42 as any as Widget;
      jest.spyOn(widgetService, 'findById').mockResolvedValue(widget);

      await expect(
        controller.createWidget(userId, { category, name }),
      ).resolves.toEqual({ widget });

      expect(widgetAbilityService.claimCreate).toHaveBeenCalledTimes(1);
      expect(widgetAbilityService.claimCreate).toHaveBeenCalledWith(userId);
      expect(widgetService.create).toHaveBeenCalledTimes(1);
      expect(widgetService.create).toHaveBeenCalledWith(userId, category, name);
      expect(widgetService.findById).toHaveBeenCalledTimes(1);
      expect(widgetService.findById).toHaveBeenCalledWith('66', userId);
    });
  });

  describe('getWidgetById', () => {
    it('should check access and call the widgetService with the proper params', async () => {
      const userId = '101';
      const widgetId = '66';

      jest.spyOn(widgetAbilityService, 'claimRead').mockResolvedValue();
      const widget = 42 as any as Widget;
      jest.spyOn(widgetService, 'findById').mockResolvedValue(widget);

      await expect(controller.getWidgetById(userId, widgetId)).resolves.toEqual(
        { widget },
      );

      expect(widgetAbilityService.claimRead).toHaveBeenCalledTimes(1);
      expect(widgetAbilityService.claimRead).toHaveBeenCalledWith(
        userId,
        widgetId,
      );
      expect(widgetService.findById).toHaveBeenCalledTimes(1);
      expect(widgetService.findById).toHaveBeenCalledWith(widgetId, userId);
    });
  });

  describe('saveWidget', () => {
    it('should check access and call the widgetService with the proper params', async () => {
      const userId = '101';
      const view = 'view';
      const name = 'name';
      const viewParameters = {};
      const widgetId = '66';

      jest.spyOn(widgetAbilityService, 'claimModify').mockResolvedValue();
      jest.spyOn(widgetService, 'save').mockResolvedValue(undefined as any);
      const widget = 42 as any as Widget;
      jest.spyOn(widgetService, 'findById').mockResolvedValue(widget);

      await expect(
        controller.saveWidget(userId, widgetId, { name, view, viewParameters }),
      ).resolves.toEqual({ widget });

      expect(widgetAbilityService.claimModify).toHaveBeenCalledTimes(1);
      expect(widgetAbilityService.claimModify).toHaveBeenCalledWith(
        userId,
        widgetId,
      );
      expect(widgetService.save).toHaveBeenCalledTimes(1);
      expect(widgetService.save).toHaveBeenCalledWith(
        userId,
        widgetId,
        name,
        undefined,
        view,
        viewParameters,
      );
      expect(widgetService.findById).toHaveBeenCalledTimes(1);
      expect(widgetService.findById).toHaveBeenCalledWith(widgetId, userId);
    });
  });

  describe('deleteWidget', () => {
    it('should check access and call the widgetService with the proper params', async () => {
      const userId = '101';
      const widgetId = '66';

      jest.spyOn(widgetAbilityService, 'claimDelete').mockResolvedValue();
      jest.spyOn(widgetService, 'deleteWidget').mockResolvedValue(undefined);

      await expect(controller.deleteWidget(userId, widgetId)).resolves.toEqual(
        {},
      );

      expect(widgetAbilityService.claimDelete).toHaveBeenCalledTimes(1);
      expect(widgetAbilityService.claimDelete).toHaveBeenCalledWith(
        userId,
        widgetId,
      );
      expect(widgetService.deleteWidget).toHaveBeenCalledTimes(1);
      expect(widgetService.deleteWidget).toHaveBeenCalledWith(widgetId);
    });
  });

  describe('getSubcategories', () => {
    it('should check access and call the widgetService with the proper params', async () => {
      const userId = '101';
      const widgetId = '66';
      const query = 'query';

      jest.spyOn(widgetAbilityService, 'claimModify').mockResolvedValue();
      const subcategories = 42 as any as SubcategoryDto[];
      jest
        .spyOn(widgetService, 'querySubcategories')
        .mockResolvedValue(subcategories);

      await expect(
        controller.getSubcategories(userId, widgetId, { query }),
      ).resolves.toEqual({ subcategories });

      expect(widgetAbilityService.claimModify).toHaveBeenCalledTimes(1);
      expect(widgetAbilityService.claimModify).toHaveBeenCalledWith(
        userId,
        widgetId,
      );
      expect(widgetService.querySubcategories).toHaveBeenCalledTimes(1);
      expect(widgetService.querySubcategories).toHaveBeenCalledWith(
        userId,
        widgetId,
        query,
      );
    });
  });

  describe('setSubcategories', () => {
    it('should check access and call the widgetService with the proper params', async () => {
      const userId = '101';
      const widgetId = '66';
      const query = 'query';
      const subcategoriesDto = ['1', '2', '4'];

      jest.spyOn(widgetAbilityService, 'claimModify').mockResolvedValue();
      jest
        .spyOn(widgetService, 'setSubcategories')
        .mockResolvedValue(undefined);
      const subcategories = 42 as any as SubcategoryDto[];
      jest
        .spyOn(widgetService, 'querySubcategories')
        .mockResolvedValue(subcategories);
      const widget = 43 as any as Widget;
      jest.spyOn(widgetService, 'findById').mockResolvedValue(widget);

      await expect(
        controller.setSubcategories(
          userId,
          widgetId,
          { subcategories: subcategoriesDto },
          { query },
        ),
      ).resolves.toEqual({ widget, subcategories });

      expect(widgetAbilityService.claimModify).toHaveBeenCalledTimes(1);
      expect(widgetAbilityService.claimModify).toHaveBeenCalledWith(
        userId,
        widgetId,
      );
      expect(widgetService.setSubcategories).toHaveBeenCalledTimes(1);
      expect(widgetService.setSubcategories).toHaveBeenCalledWith(
        userId,
        widgetId,
        subcategoriesDto,
      );
      expect(widgetService.querySubcategories).toHaveBeenCalledTimes(1);
      expect(widgetService.querySubcategories).toHaveBeenCalledWith(
        userId,
        widgetId,
        query,
      );
      expect(widgetService.findById).toHaveBeenCalledTimes(1);
      expect(widgetService.findById).toHaveBeenCalledWith(widgetId, userId);
    });
  });

  describe('getMetrics', () => {
    it('should check access and call the widgetService with the proper params', async () => {
      const userId = '101';
      const widgetId = '66';
      const query = 'query';

      jest.spyOn(widgetAbilityService, 'claimModify').mockResolvedValue();
      const metrics = 42 as any as MetricDto[];
      const presets = 43 as any as MetricDto[];
      jest
        .spyOn(widgetService, 'queryMetrics')
        .mockResolvedValue({ metrics, presets });

      await expect(
        controller.getMetrics(userId, widgetId, { query }),
      ).resolves.toEqual({ metrics, presets });

      expect(widgetAbilityService.claimModify).toHaveBeenCalledTimes(1);
      expect(widgetAbilityService.claimModify).toHaveBeenCalledWith(
        userId,
        widgetId,
      );
      expect(widgetService.queryMetrics).toHaveBeenCalledTimes(1);
      expect(widgetService.queryMetrics).toHaveBeenCalledWith(
        userId,
        widgetId,
        query,
      );
    });
  });

  describe('setMetrics', () => {
    it('should check access and call the widgetService with the proper params', async () => {
      const userId = '101';
      const widgetId = '66';
      const metricsDto = ['1', '2'];
      const preset = '30';
      const query = 'query';

      jest.spyOn(widgetAbilityService, 'claimModify').mockResolvedValue();
      jest.spyOn(widgetService, 'setMetrics').mockResolvedValue(undefined);
      const metrics = 42 as any as MetricDto[];
      const presets = 43 as any as MetricDto[];
      jest
        .spyOn(widgetService, 'queryMetrics')
        .mockResolvedValue({ metrics, presets });
      const widget = 43 as any as Widget;
      jest.spyOn(widgetService, 'findById').mockResolvedValue(widget);

      await expect(
        controller.setMetrics(
          userId,
          widgetId,
          { metrics: metricsDto, preset },
          { query },
        ),
      ).resolves.toEqual({ metrics: { metrics, presets }, widget });

      expect(widgetAbilityService.claimModify).toHaveBeenCalledTimes(1);
      expect(widgetAbilityService.claimModify).toHaveBeenCalledWith(
        userId,
        widgetId,
      );
      expect(widgetService.queryMetrics).toHaveBeenCalledTimes(1);
      expect(widgetService.queryMetrics).toHaveBeenCalledWith(
        userId,
        widgetId,
        query,
      );
      expect(widgetService.findById).toHaveBeenCalledTimes(1);
      expect(widgetService.findById).toHaveBeenCalledWith(widgetId, userId);
      expect(widgetService.setMetrics).toHaveBeenCalledTimes(1);
      expect(widgetService.setMetrics).toHaveBeenCalledWith(
        userId,
        widgetId,
        metricsDto,
        preset,
      );
    });
  });

  describe('getData', () => {
    it('should check access and call the widgetService with the proper params', async () => {
      const userId = '101';
      const widgetId = '66';
      const params = { some: 'params' } as any as ExecuteParamsDto;

      jest.spyOn(widgetAbilityService, 'claimExecute').mockResolvedValue();
      const data = 'data' as any as ExecuteWidgetDto;
      jest.spyOn(executeWidgetService, 'executeWidget').mockResolvedValue(data);

      await expect(
        controller.getData(userId, widgetId, params),
      ).resolves.toEqual({ data });

      expect(widgetAbilityService.claimExecute).toHaveBeenCalledTimes(1);
      expect(widgetAbilityService.claimExecute).toHaveBeenCalledWith(
        userId,
        widgetId,
      );
      expect(executeWidgetService.executeWidget).toHaveBeenCalledTimes(1);
      expect(executeWidgetService.executeWidget).toHaveBeenCalledWith(
        userId,
        widgetId,
        params,
      );
    });
  });
});
