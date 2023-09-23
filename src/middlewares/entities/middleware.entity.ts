import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Pipeline } from '../../pipelines/entities/pipeline.entity';
import { ApiProperty } from '@nestjs/swagger';

export type MiddlewareId = string;

@Entity('middleware')
@Unique(['pipeline', 'order'])
export class Middleware {
  @ApiProperty({
    description: "middleware's uuid",
  })
  @PrimaryGeneratedColumn('uuid')
  id: MiddlewareId;

  @ApiProperty({
    description: "middleware's type",
    example: 'coingecko-wallet-token-price',
  })
  @Column({ name: 'type' })
  type: string;

  @ApiProperty({
    description: "middleware's config",
  })
  @Column({ name: 'config', type: 'json' })
  config: object;

  @ManyToOne(() => Pipeline)
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;

  @Column({ name: 'order' })
  order: number;
}
