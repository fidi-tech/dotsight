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
  let repository: Repository<Widget>;

  beforeEach(async () => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
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
  });

  describe('queryWidgets', () => {
    it('should get widgets from the repository & enrich them with abilities', async () => {
      const userId = '42';
      const limit = 100;
      const offset = 13;
      const query = 'anything';

      jest
        .spyOn(widgetAbilityService, 'addAbilities')
        .mockImplementation((userId, widget: any) => {
          widget.ability = `${userId}-${widget.id}`;
        });
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

      jest
        .spyOn(widgetAbilityService, 'addAbilities')
        .mockImplementation((userId, widget: any) => {
          widget.ability = `${userId}-${widget.id}`;
        });
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
});
