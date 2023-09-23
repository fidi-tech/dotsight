import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pipeline } from '../../pipelines/entities/pipeline.entity';
import { ApiProperty } from '@nestjs/swagger';

export type MixerId = string;

@Entity('mixer')
export class Mixer {
  @ApiProperty({
    description: "mixer's uuid",
  })
  @PrimaryGeneratedColumn('uuid')
  id: MixerId;

  @ApiProperty({
    description: 'bound entity',
    example: 'walletToken',
  })
  @Column({ name: 'entity' })
  entity: string;

  @ApiProperty({
    description: "mixer's specified config",
  })
  @Column({ name: 'config', type: 'json' })
  config: object;

  @ManyToOne(() => Pipeline)
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;
}
