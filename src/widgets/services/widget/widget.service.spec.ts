import { WidgetService } from './widget.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TestDbModule } from '../../../common/spec/db';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Widget } from '../../entities/widget.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Like, Repository } from 'typeorm';
import { WidgetAbilityService } from '../widget-ability/widget-ability.service';
import { CategoriesService } from '../../../categories/services/categories.service';
import { DataSourceService } from '../../../data-sources/services/data-source/data-source.service';

describe('WidgetService', () => {
  let service: WidgetService;
  let widgetAbilityService: WidgetAbilityService;
  let categoriesService: CategoriesService;
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
        CategoriesService,
        DataSourceService,
      ],
    })
      .overrideProvider(getRepositoryToken(Widget))
      .useValue(repository)
      .compile();

    service = module.get<WidgetService>(WidgetService);

    widgetAbilityService =
      module.get<WidgetAbilityService>(WidgetAbilityService);
    categoriesService = module.get<CategoriesService>(CategoriesService);
  });

  beforeEach(() => {
    jest
      .spyOn(widgetAbilityService, 'addAbilities')
      .mockImplementation((userId, widget: any) => {
        widget.ability = `${userId}-${widget.id}`;
      });
  });

  describe('queryWidgets', () => {
    it('should get widgets from the repository & enrich them with abilities', async () => {
      const userId = '42';
      const limit = 100;
      const offset = 13;
      const query = 'anything';

      const result = [{ id: 'w1' }, { id: 'w2' }] as any as Widget[];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      await expect(
        service.queryWidgets(userId, limit, offset, query),
      ).resolves.toEqual(
        result.map((widget) => ({
          ...widget,
          ability: `${userId}-${widget.id}`,
        })),
      );

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { createdBy: { id: userId }, name: Like(`%${query}%`) },
        relations: ['createdBy'],
        order: {
          createdAt: 'DESC',
        },
      });
    });
  });

  describe('findById', () => {
    it('should get widget from the repository & enrich it with abilities', async () => {
      const userId = '42';
      const widgetId = '66';

      const result = { id: widgetId } as any as Widget;
      jest.spyOn(repository, 'findOne').mockResolvedValue(result);

      await expect(service.findById(widgetId, userId)).resolves.toEqual({
        id: widgetId,
        ability: `${userId}-${widgetId}`,
      });

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: widgetId },
        relations: ['createdBy'],
      });
    });
  });

  describe('create', () => {
    it('should create widget in the repository & enrich it with abilities', async () => {
      const userId = '42';
      const category = 'cat';
      const name = 'n1';

      jest
        .spyOn(repository, 'create')
        .mockResolvedValue({ id: 'w1' } as any as never);
      jest.spyOn(repository, 'save').mockResolvedValue(undefined);

      await expect(service.create(userId, category, name)).resolves.toEqual({
        id: 'w1',
        ability: `${userId}-w1`,
      });

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith({
        category,
        name,
        createdBy: { id: userId },
      });
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'w1' }),
      );
    });
  });

  describe('deleteWidget', () => {
    it('should delete the widget from the repository', async () => {
      const widgetId = '42';

      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

      await expect(service.deleteWidget(widgetId)).resolves.toEqual(undefined);

      expect(repository.delete).toHaveBeenCalledTimes(1);
      expect(repository.delete).toHaveBeenCalledWith({ id: widgetId });
    });
  });

  describe('querySubcategories', () => {
    it('should return an empty array if category is not selected', async () => {
      const userId = '66';
      const widgetId = '42';
      jest.spyOn(repository, 'findOne').mockResolvedValue({
        id: widgetId,
        category: undefined,
      } as any as Widget);

      await expect(
        service.querySubcategories(userId, widgetId),
      ).resolves.toEqual([]);
    });

    it('should return selected subcategories & subcategories by the query', async () => {
      const userId = '66';
      const widgetId = '42';
      const category = 'cat';

      jest.spyOn(repository, 'findOne').mockResolvedValue({
        id: widgetId,
        category,
        subcategories: ['1', '3'],
      } as any as Widget);
      jest.spyOn(categoriesService, 'findSubcategories').mockResolvedValue([
        { name: 'bc1', id: '1', icon: 'i1' },
        { name: 'ac2', id: '2', icon: 'i2' },
      ]);
      jest
        .spyOn(categoriesService, 'findSubcategoriesByIds')
        .mockResolvedValue([
          { name: 'bc1', id: '1', icon: 'i1' },
          { name: 'cc3', id: '3', icon: 'i3' },
        ]);

      await expect(
        service.querySubcategories(userId, widgetId),
      ).resolves.toEqual([
        {
          icon: 'i2',
          id: '2',
          isAvailable: true,
          isSelected: false,
          name: 'ac2',
        },
        {
          icon: 'i1',
          id: '1',
          isAvailable: true,
          isSelected: true,
          name: 'bc1',
        },
        {
          icon: 'i3',
          id: '3',
          isAvailable: true,
          isSelected: true,
          name: 'cc3',
        },
      ]);
    });
  });
});
