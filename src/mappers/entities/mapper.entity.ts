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

export type MapperId = string;
export type MapperCode = string;

@Entity('mapper')
@Unique(['code', 'pipeline'])
export class Mapper {
  @ApiProperty({
    description: "mapper's uuid",
  })
  @PrimaryGeneratedColumn('uuid')
  id: MapperId;

  @ApiProperty({
    description: "mapper's human readable code",
    example: 'output-0',
  })
  @Column({ name: 'code' })
  code: MapperCode;

  @ApiProperty({
    description: "mapper's type",
  })
  @Column({ name: 'type' })
  type: string;

  @ApiProperty({
    description: "mapper's config",
  })
  @Column({ name: 'config', type: 'json' })
  config: object;

  @ManyToOne(() => Pipeline)
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;
}
