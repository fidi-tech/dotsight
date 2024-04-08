import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Trace } from './trace.entity';
import { DataSourceId } from '../../data-sources/entities/data-source.entity';

export type TracePieceId = number;

@Entity('trace_piece')
export class TracePiece {
  @PrimaryGeneratedColumn()
  id: TracePieceId;

  @Column('text', {})
  dataSourceId: DataSourceId;

  @Column()
  latencyMs: number;

  @Column()
  error: boolean;

  @ManyToOne(() => Trace, (trace) => trace.pieces)
  trace: Trace;
}
