import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TracePiece } from './trace-piece.entity';

export type TraceId = string;

@Entity('trace')
export class Trace {
  @PrimaryGeneratedColumn('uuid')
  id: TraceId;

  @Column('text', { array: true, default: [] })
  subcategories: string[];

  @Column('text', { array: true, nullable: true })
  metrics?: string[];

  @Column('text', { nullable: true })
  preset?: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => TracePiece, (piece) => piece.trace)
  pieces: TracePiece[];
}
