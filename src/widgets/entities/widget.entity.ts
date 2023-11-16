import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pipeline } from '../../pipelines/entities/pipeline.entity';
import { Mapper } from '../../mappers/entities/mapper.entity';
import { ApiProperty } from '@nestjs/swagger';

export type WidgetId = string;

@Entity('widget')
export class Widget {
  @ApiProperty({
    description: "widget's uuid",
  })
  @PrimaryGeneratedColumn('uuid')
  id: WidgetId;

  @ApiProperty({
    description: "widget's type",
  })
  @Column({ name: 'type' })
  type: string;

  @ApiProperty({
    description: "widget's config",
  })
  @Column({ name: 'config', type: 'json' })
  config: object;

  @ApiProperty({
    description: "widget's compatible datashape",
  })
  @Column({ name: 'datashape' })
  datashape: string;

  @OneToOne(() => Mapper)
  @JoinColumn({ name: 'mapper_id' })
  mapper?: Mapper;

  @ManyToOne(() => Pipeline)
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;
}
