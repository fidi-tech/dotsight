import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryRunner, Repository } from 'typeorm';
import { Widget, WidgetId } from '../../entities/widget.entity';
import { PipelineId } from '../../../pipelines/entities/pipeline.entity';
import { MapperService } from '../../../mappers/services/mapper/mapper.service';

@Injectable()
export class WidgetService {
  constructor(
    @InjectRepository(Widget)
    private readonly widgetRepository: Repository<Widget>,
    private readonly mapperService: MapperService,
  ) {}

  private getWidgetRepository(qr?: QueryRunner) {
    if (qr) {
      return qr.connection.getRepository(Widget);
    }
    return this.widgetRepository;
  }

  async create(
    pipelineId: PipelineId,
    type: string,
    config: object,
    datashape: string,
    qr?: QueryRunner,
  ) {
    const widget = this.getWidgetRepository(qr).create({
      pipeline: { id: pipelineId },
      type,
      config,
      datashape,
    });
    return this.getWidgetRepository(qr).save(widget);
  }

  async findById(id: WidgetId, qr?: QueryRunner) {
    const widget = await this.getWidgetRepository(qr).findOneBy({ id });
    if (!widget) {
      throw new NotFoundException(`Widget #${id} not found`);
    }
    return widget;
  }

  async findByIds(ids: WidgetId[], qr?: QueryRunner) {
    const widgets = await this.getWidgetRepository(qr).find({
      where: {
        id: In(ids),
      },
      relations: {
        mapper: true,
      },
    });
    const notFound = ids.filter(
      (id) => !widgets.find((widget) => widget.id === id),
    );
    if (notFound.length > 0) {
      throw new NotFoundException(
        `Widgets #{${notFound.join(', ')}} not found`,
      );
    }
    return widgets;
  }

  async addMapper(
    pipelineId: PipelineId,
    widgetId: WidgetId,
    code: string,
    type: string,
    config: object,
    qr?: QueryRunner,
  ) {
    const widget = await this.findById(widgetId, qr);
    const datashape = this.mapperService.getDatashapeByType(type);
    if (widget.datashape !== datashape) {
      throw new BadRequestException(
        `Mapper ${type}'s datashape (${datashape}) did not match widget ${widgetId} datashape (${widget.datashape})`,
      );
    }

    widget.mapper = await this.mapperService.create(
      pipelineId,
      code,
      type,
      config,
      qr,
    );
    return this.getWidgetRepository(qr).save(widget);
  }
}
