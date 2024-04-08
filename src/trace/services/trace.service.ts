import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trace, TraceId } from '../entities/trace.entity';
import { TracePiece } from '../entities/trace-piece.entity';
import {
  MetricId,
  PresetId,
  SubcategoryId,
} from '../../common/categories/abstract.category';
import { DataSourceId } from '../../data-sources/entities/data-source.entity';

@Injectable()
export class TraceService {
  constructor(
    @InjectRepository(Trace)
    private readonly traceRepository: Repository<Trace>,
    @InjectRepository(TracePiece)
    private readonly tracePieceRepository: Repository<TracePiece>,
  ) {}

  public async create(
    subcategories: SubcategoryId[],
    metrics?: MetricId[],
    preset?: PresetId,
  ) {
    const trace = this.traceRepository.create();
    trace.subcategories = subcategories;
    trace.metrics = metrics;
    trace.preset = preset;
    return this.traceRepository.save(trace);
  }

  public async addPiece(
    traceId: TraceId,
    dataSourceId: DataSourceId,
    latencyMs: number,
    error: boolean,
  ) {
    const piece = await this.tracePieceRepository.create();
    piece.trace = { id: traceId } as Trace;
    piece.dataSourceId = dataSourceId;
    piece.latencyMs = latencyMs;
    piece.error = error;
    return this.tracePieceRepository.save(piece);
  }
}
