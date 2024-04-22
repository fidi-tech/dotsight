import { Repository } from 'typeorm';
import { Widget } from '../../entities/widget.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { TestDbModule } from '../../../common/spec/db';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { WidgetService } from './widget.service';
import { WidgetAbilityService } from '../widget-ability/widget-ability.service';
import { CategoriesService } from '../../../categories/services/categories.service';
import { DataSourceService } from '../../../data-sources/services/data-source/data-source.service';
import { ExecuteWidgetService } from './execute-widget.service';
import { BadRequestException } from '@nestjs/common';

describe('ExecuteWidgetService', () => {
  let service: ExecuteWidgetService;
  let categoriesService: CategoriesService;
  let datasourceService: DataSourceService;
  let widgetAbilityService: WidgetAbilityService;
  let repository: Repository<Widget>;

  beforeEach(async () => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any as Repository<Widget>;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        TypeOrmModule.forFeature([Widget]),
        JwtModule,
        ConfigModule,
      ],
      controllers: [],
      providers: [
        WidgetService,
        WidgetAbilityService,
        ExecuteWidgetService,
        CategoriesService,
        DataSourceService,
      ],
    })
      .overrideProvider(getRepositoryToken(Widget))
      .useValue(repository)
      .compile();

    service = module.get<ExecuteWidgetService>(ExecuteWidgetService);

    widgetAbilityService =
      module.get<WidgetAbilityService>(WidgetAbilityService);
    categoriesService = module.get<CategoriesService>(CategoriesService);
    datasourceService = module.get<DataSourceService>(DataSourceService);
  });

  beforeEach(() => {
    jest
      .spyOn(widgetAbilityService, 'addAbilities')
      .mockImplementation((userId, widget: any) => {
        widget.ability = `${userId}-${widget.id}`;
      });
  });

  describe('executeWidget', () => {
    it("should throw if widget's subcategories are not selected", async () => {
      const widgetId = '42';
      const userId = '101';
      const params = {};

      jest.spyOn(repository, 'findOne').mockResolvedValue({
        id: widgetId,
        category: 'cat',
        subcategories: [],
        metrics: ['1', '2'],
        createdBy: { id: '102' },
      } as any as Widget);

      await expect(
        service.executeWidget(userId, widgetId, params),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if widget has no metrics & no preset selected', async () => {
      const widgetId = '42';
      const userId = '101';
      const params = {};

      jest.spyOn(repository, 'findOne').mockResolvedValue({
        id: widgetId,
        category: 'cat',
        subcategories: ['10', '20'],
        metrics: [],
        createdBy: { id: '102' },
      } as any as Widget);

      await expect(
        service.executeWidget(userId, widgetId, params),
      ).rejects.toThrow(BadRequestException);
    });

    it('should get data by the selected metrics', async () => {
      const widgetId = '42';
      const userId = '101';
      const params = {};

      jest.spyOn(repository, 'findOne').mockResolvedValue({
        id: widgetId,
        category: 'cat',
        subcategories: ['i1', 'i2'],
        metrics: ['m1', 'm2'],
        createdBy: { id: '102' },
      } as any as Widget);
      jest.spyOn(categoriesService, 'findMetrics').mockResolvedValue([
        { id: 'm1', name: 'metric1', icon: null },
        { id: 'm2', name: 'metric2', icon: null },
      ]);
      jest
        .spyOn(categoriesService, 'findSubcategoriesByIds')
        .mockResolvedValue([
          { id: 'i1', name: 'subcategory1', icon: null },
          { id: 'i2', name: 'subcategory2', icon: null },
        ]);
      const getItems1 = jest.fn(async () => ({
        items: [
          {
            id: 'i1',
            name: 'item1',
            icon: null,
            metrics: {
              m1: [{ timestamp: 10, value: 42 }],
              m2: [{ timestamp: 11, value: 43 }],
            },
          },
          {
            id: 'i2',
            name: 'item2',
            icon: null,
            metrics: {
              m1: [{ timestamp: 13, value: 142 }],
              m2: [{ timestamp: 14, value: 143 }],
            },
          },
        ],
        meta: { meta: 'true', units: { usd1: { id: 'usd1' } } },
      }));
      const getCopyright1 = jest.fn(() => ({
        id: 'copy1',
        name: 'copyright1',
        icon: null,
      }));
      const getItems2 = jest.fn(async () => ({
        items: [
          {
            id: 'i1',
            name: 'item1',
            icon: null,
            metrics: {
              m1: [{ timestamp: 12, value: 44 }],
              m2: [{ timestamp: 13, value: 45 }],
            },
          },
          {
            id: 'i3',
            name: 'item2',
            icon: null,
            metrics: {
              m1: [{ timestamp: 13, value: 242 }],
              m2: [{ timestamp: 14, value: 243 }],
            },
          },
        ],
        meta: { meta: 'true', units: { usd1: { id: 'usd1' } } },
      }));
      const getCopyright2 = jest.fn(() => ({
        id: 'copy2',
        name: 'copyright2',
        icon: null,
      }));
      jest.spyOn(datasourceService, 'getDatasources').mockResolvedValue([
        {
          getCopyright: getCopyright1,
          getItems: getItems1,
        },
        {
          getCopyright: getCopyright2,
          getItems: getItems2,
        },
      ] as any);

      await expect(
        service.executeWidget(userId, widgetId, params),
      ).resolves.toEqual({
        units: {
          usd1: { id: 'usd1' },
        },
        items: {
          i1: {
            id: 'i1',
            name: 'subcategory1',
            icon: null,
          },
          i2: {
            id: 'i2',
            name: 'subcategory2',
            icon: null,
          },
        },
        metrics: {
          m1: {
            id: 'm1',
            name: 'metric1',
            icon: null,
          },
          m2: {
            id: 'm2',
            name: 'metric2',
            icon: null,
          },
        },
        data: {
          items: ['i1', 'i2', 'i3'],
          metrics: ['m1', 'm2'],
          copyrights: {
            i1: {
              copy1: {
                icon: null,
                id: 'copy1',
                name: 'copyright1',
              },
              copy2: {
                icon: null,
                id: 'copy2',
                name: 'copyright2',
              },
            },
            i2: {
              copy1: {
                icon: null,
                id: 'copy1',
                name: 'copyright1',
              },
            },
            i3: {
              copy2: {
                icon: null,
                id: 'copy2',
                name: 'copyright2',
              },
            },
          },
          values: {
            i1: {
              m1: [
                { timestamp: 10, value: 42 },
                { timestamp: 12, value: 44 },
              ],
              m2: [
                { timestamp: 11, value: 43 },
                { timestamp: 13, value: 45 },
              ],
            },
            i2: {
              m1: [{ timestamp: 13, value: 142 }],
              m2: [{ timestamp: 14, value: 143 }],
            },
            i3: {
              m1: [{ timestamp: 13, value: 242 }],
              m2: [{ timestamp: 14, value: 243 }],
            },
          },
        },
      });

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        relations: ['createdBy'],
        where: { id: widgetId },
      });

      expect(categoriesService.findMetrics).toHaveBeenCalledTimes(1);
      expect(categoriesService.findMetrics).toHaveBeenCalledWith('cat');

      expect(categoriesService.findSubcategoriesByIds).toHaveBeenCalledTimes(1);
      expect(categoriesService.findSubcategoriesByIds).toHaveBeenCalledWith(
        'cat',
        ['i1', 'i2'],
      );

      expect(datasourceService.getDatasources).toHaveBeenCalledTimes(1);
      expect(datasourceService.getDatasources).toHaveBeenCalledWith(
        'cat',
        ['i1', 'i2'],
        ['m1', 'm2'],
        undefined,
      );

      expect(getItems1).toHaveBeenCalledTimes(1);
      expect(getItems1).toHaveBeenCalledWith({
        metrics: ['m1', 'm2'],
        preset: undefined,
        subcategories: ['i1', 'i2'],
      });
      expect(getItems2).toHaveBeenCalledTimes(1);
      expect(getItems2).toHaveBeenCalledWith({
        metrics: ['m1', 'm2'],
        preset: undefined,
        subcategories: ['i1', 'i2'],
      });

      expect(getCopyright1).toHaveBeenCalledTimes(1);
      expect(getCopyright1).toHaveBeenCalledWith();
      expect(getCopyright2).toHaveBeenCalledTimes(1);
      expect(getCopyright2).toHaveBeenCalledWith();
    });

    it('should get data by the selected preset', async () => {
      const widgetId = '42';
      const userId = '101';
      const params = {};

      jest.spyOn(repository, 'findOne').mockResolvedValue({
        id: widgetId,
        category: 'cat',
        subcategories: ['i1', 'i2'],
        preset: 'p1',
        createdBy: { id: '102' },
      } as any as Widget);
      const getMetricsByPreset = jest.fn(() => ({
        m1: { id: 'm1', name: 'metric1', icon: null },
        m2: { id: 'm2', name: 'metric2', icon: null },
      }));
      jest.spyOn(categoriesService, 'findCategory').mockImplementation(
        () =>
          ({
            getMetricsByPreset,
          } as any),
      );
      const getItems = jest.fn(async () => ({
        items: [
          {
            id: 'i1',
            name: 'item1',
            icon: null,
            metrics: {
              m1: [{ timestamp: 10, value: 42 }],
              m2: [{ timestamp: 11, value: 43 }],
            },
          },
          {
            id: 'i2',
            name: 'item2',
            icon: null,
            metrics: {
              m1: [{ timestamp: 13, value: 142 }],
              m2: [{ timestamp: 14, value: 143 }],
            },
          },
        ],
        meta: { meta: 'true', units: { usd1: { id: 'usd1' } } },
      }));
      const getCopyright = jest.fn(() => ({
        id: 'copy1',
        name: 'copyright1',
        icon: null,
      }));
      jest.spyOn(datasourceService, 'getDatasources').mockResolvedValue([
        {
          getCopyright,
          getItems,
        },
      ] as any);

      await expect(
        service.executeWidget(userId, widgetId, params),
      ).resolves.toEqual({
        units: {
          usd1: { id: 'usd1' },
        },
        items: {
          i1: {
            id: 'i1',
            name: 'item1',
            icon: null,
          },
          i2: {
            id: 'i2',
            name: 'item2',
            icon: null,
          },
        },
        metrics: {
          m1: {
            id: 'm1',
            name: 'metric1',
            icon: null,
          },
          m2: {
            id: 'm2',
            name: 'metric2',
            icon: null,
          },
        },
        data: {
          items: ['i1', 'i2'],
          metrics: ['m1', 'm2'],
          copyrights: {
            i1: {
              copy1: {
                icon: null,
                id: 'copy1',
                name: 'copyright1',
              },
            },
            i2: {
              copy1: {
                icon: null,
                id: 'copy1',
                name: 'copyright1',
              },
            },
          },
          values: {
            i1: {
              m1: [{ timestamp: 10, value: 42 }],
              m2: [{ timestamp: 11, value: 43 }],
            },
            i2: {
              m1: [{ timestamp: 13, value: 142 }],
              m2: [{ timestamp: 14, value: 143 }],
            },
          },
        },
      });

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        relations: ['createdBy'],
        where: { id: widgetId },
      });

      expect(datasourceService.getDatasources).toHaveBeenCalledTimes(1);
      expect(datasourceService.getDatasources).toHaveBeenCalledWith(
        'cat',
        ['i1', 'i2'],
        undefined,
        'p1',
      );

      expect(getItems).toHaveBeenCalledTimes(1);
      expect(getItems).toHaveBeenCalledWith({
        metrics: undefined,
        preset: 'p1',
        subcategories: ['i1', 'i2'],
      });

      expect(getCopyright).toHaveBeenCalledTimes(1);
      expect(getCopyright).toHaveBeenCalledWith();
    });
  });
});
