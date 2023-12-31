import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pipeline } from '../../pipelines/entities/pipeline.entity';
import { ApiProperty } from '@nestjs/swagger';

export type DataSourceId = string;

@Entity('data_source')
export class DataSource {
  @ApiProperty({
    description: "data source's uuid",
  })
  @PrimaryGeneratedColumn('uuid')
  id: DataSourceId;

  @ApiProperty({
    description: "data source's type",
  })
  @Column({ name: 'type' })
  type: string;

  @ApiProperty({
    description: "data source's specified config",
  })
  @Column({ name: 'config', type: 'json' })
  config: object;

  @ManyToOne(() => Pipeline)
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;
}
