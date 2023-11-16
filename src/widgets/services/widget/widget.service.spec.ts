import { Test, TestingModule } from '@nestjs/testing';
import { In, QueryRunner, Repository } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TestDbModule } from '../../../common/spec/db';
import { WidgetService } from './widget.service';
import { Widget } from '../../entities/widget.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MappersModule } from '../../../mappers/mappers.module';
import { MapperService } from '../../../mappers/services/mapper/mapper.service';
import { Mapper } from '../../../mappers/entities/mapper.entity';

describe('WidgetService', () => {
  let service: WidgetService;
  let mapperService: MapperService;
  let repository: Repository<Widget>;
  let txRepository: Repository<Widget>;
  let qr: QueryRunner;

  beforeEach(async () => {
    repository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    } as any as Repository<Widget>;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDbModule,
        TypeOrmModule.forFeature([Widget]),
        MappersModule,
      ],
      providers: [WidgetService],
    })
      .overrideProvider(getRepositoryToken(Widget))
      .useValue(repository)
      .compile();

    service = module.get<WidgetService>(WidgetService);
    mapperService = module.get<MapperService>(MapperService);

    txRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    } as any as Repository<Widget>;
    qr = {
      connection: {
        getRepository: jest.fn(() => txRepository),
      },
    } as any as QueryRunner;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a mapper in the repository', async () => {
      const widgetDraft = { 'yet-another': 'mapper' } as any as Widget;
      const widget = { hello: 'there' } as any as Widget;
      (repository.create as jest.MockedFn<any>).mockImplementation(
        () => widgetDraft,
      );
      (repository.save as jest.MockedFn<any>).mockResolvedValue(widget);

      const result = await service.create(
        '42',
        'some-type',
        {
          some: 'field',
          another: 'also field',
        },
        'some-datashape',
      );

      expect(repository.create).toHaveBeenCalledWith({
        pipeline: { id: '42' },
        type: 'some-type',
        config: {
          some: 'field',
          another: 'also field',
        },
        datashape: 'some-datashape',
      });
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(widgetDraft);
      expect(result).toEqual(widget);
    });

    it('should use instantiated tx repository if QueryRunner parameter is passed', async () => {
      const widgetDraft = { 'yet-another': 'mapper' } as any as Widget;
      const widget = { hello: 'there' } as any as Widget;
      (txRepository.create as jest.MockedFn<any>).mockImplementation(
        () => widgetDraft,
      );
      (txRepository.save as jest.MockedFn<any>).mockResolvedValue(widget);

      await service.create(
        '42',
        'some-type',
        {
          some: 'field',
          another: 'also field',
        },
        'some-datashape',
        qr,
      );

      expect(qr.connection.getRepository).toHaveBeenCalledWith(Widget);
      expect(txRepository.create).toHaveBeenCalledWith({
        pipeline: { id: '42' },
        type: 'some-type',
        config: {
          some: 'field',
          another: 'also field',
        },
        datashape: 'some-datashape',
      });
      expect(txRepository.save).toHaveBeenCalledTimes(1);
      expect(txRepository.save).toHaveBeenCalledWith(widgetDraft);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if widget was not found', async () => {
      (repository.findOneBy as jest.MockedFn<any>).mockResolvedValue(null);

      await expect(service.findById('42')).rejects.toThrow(NotFoundException);
    });

    it('should return found widget', async () => {
      const widget = { hello: 'there' } as any as Widget;
      (repository.findOneBy as jest.MockedFn<any>).mockResolvedValue(widget);

      const result = await service.findById('42');

      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '42' });
      await expect(result).toEqual(widget);
    });

    it('should use instantiated tx repository if QueryRunner parameter is passed', async () => {
      const widget = { hello: 'there' } as any as Widget;
      (txRepository.findOneBy as jest.MockedFn<any>).mockResolvedValue(widget);

      await service.findById('42', qr);

      expect(txRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(txRepository.findOneBy).toHaveBeenCalledWith({ id: '42' });
    });
  });

  describe('findByIds', () => {
    it('should throw NotFoundException if some widget was not found', async () => {
      (repository.find as jest.MockedFn<any>).mockResolvedValue([
        { id: 'w1' },
        { id: 'w2' },
        { id: 'w33' },
      ]);

      await expect(() => service.findByIds(['w1', 'w2', 'w3'])).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return found widgets', async () => {
      const widgets = [{ id: 'w1' }, { id: 'w2' }];
      (repository.find as jest.MockedFn<any>).mockResolvedValue(widgets);

      await expect(service.findByIds(['w1', 'w2'])).resolves.toEqual(widgets);
      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          id: In(['w1', 'w2']),
        },
        relations: {
          mapper: true,
        },
      });
    });

    it('should use instantiated tx repository if QueryRunner parameter is passed', async () => {
      const widgets = [{ id: 'w1' }, { id: 'w2' }];
      (txRepository.find as jest.MockedFn<any>).mockResolvedValue(widgets);

      await expect(service.findByIds(['w1', 'w2'], qr)).resolves.toEqual(
        widgets,
      );
      expect(txRepository.find).toHaveBeenCalledTimes(1);
      expect(txRepository.find).toHaveBeenCalledWith({
        where: {
          id: In(['w1', 'w2']),
        },
        relations: {
          mapper: true,
        },
      });
    });
  });

  describe('addMapper', () => {
    it('should throw BadRequestException if datashapes do not match', async () => {
      const widget = { hello: 'there', datashape: 'ds1' } as any as Widget;
      (repository.findOneBy as jest.MockedFn<any>).mockResolvedValue(widget);
      jest
        .spyOn(mapperService, 'getDatashapeByType')
        .mockImplementation(() => 'ds2');

      await expect(() =>
        service.addMapper('p1', 'w1', 'c1', 't1', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a mapper', async () => {
      const widget = { hello: 'there', datashape: 'ds1' } as any as Widget;
      const result = 42 as any as Widget;
      const mapper = 66 as any as Mapper;
      (repository.findOneBy as jest.MockedFn<any>).mockResolvedValue(widget);
      jest
        .spyOn(mapperService, 'getDatashapeByType')
        .mockImplementation(() => 'ds1');
      jest.spyOn(mapperService, 'create').mockResolvedValue(mapper);
      (repository.save as jest.MockedFn<any>).mockResolvedValue(result);

      await expect(
        service.addMapper('p1', 'w1', 'c1', 't1', { c: '1' }),
      ).resolves.toEqual(result);

      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'w1' });
      expect(mapperService.getDatashapeByType).toHaveBeenCalledTimes(1);
      expect(mapperService.getDatashapeByType).toHaveBeenCalledWith('t1');
      expect(mapperService.create).toHaveBeenCalledTimes(1);
      expect(mapperService.create).toHaveBeenCalledWith(
        'p1',
        'c1',
        't1',
        {
          c: '1',
        },
        undefined,
      );
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith({ ...widget, mapper });
    });

    it('should use instantiated tx repository if QueryRunner parameter is passed', async () => {
      const widget = { hello: 'there', datashape: 'ds1' } as any as Widget;
      const result = 42 as any as Widget;
      const mapper = 66 as any as Mapper;
      (txRepository.findOneBy as jest.MockedFn<any>).mockResolvedValue(widget);
      jest
        .spyOn(mapperService, 'getDatashapeByType')
        .mockImplementation(() => 'ds1');
      jest.spyOn(mapperService, 'create').mockResolvedValue(mapper);
      (txRepository.save as jest.MockedFn<any>).mockResolvedValue(result);

      await expect(
        service.addMapper('p1', 'w1', 'c1', 't1', { c: '1' }, qr),
      ).resolves.toEqual(result);

      expect(txRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(txRepository.findOneBy).toHaveBeenCalledWith({ id: 'w1' });
      expect(mapperService.getDatashapeByType).toHaveBeenCalledTimes(1);
      expect(mapperService.getDatashapeByType).toHaveBeenCalledWith('t1');
      expect(mapperService.create).toHaveBeenCalledTimes(1);
      expect(mapperService.create).toHaveBeenCalledWith(
        'p1',
        'c1',
        't1',
        {
          c: '1',
        },
        qr,
      );
      expect(txRepository.save).toHaveBeenCalledTimes(1);
      expect(txRepository.save).toHaveBeenCalledWith({ ...widget, mapper });
    });
  });
});
