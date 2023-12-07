import { DataSource } from '../../data-sources/entities/data-source.entity';
import { Mixer } from '../../mixers/entities/mixer.entity';
import { Middleware } from '../../middlewares/entities/middleware.entity';
import { Mapper, MapperCode } from '../../mappers/entities/mapper.entity';
import {
  AfterLoad,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Widget } from '../../widgets/entities/widget.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export type PipelineId = string;

class SeveralMixersPerEntityCollisionError extends Error {
  constructor(pipelineId: PipelineId, entity: string) {
    super(`Several mixers for entity "${entity}" on pipeline "${pipelineId}"`);
  }
}

class MixerMap {
  @ApiProperty()
  mixerId: Mixer;
}

class MapperMap {
  @ApiProperty()
  mapperCode: Mapper;
}

@Entity('pipeline')
export class Pipeline {
  @ApiProperty({
    description: "pipeline's uuid",
  })
  @PrimaryGeneratedColumn('uuid')
  id: PipelineId;

  @ApiProperty({
    description: "pipeline's name",
  })
  @Column({ name: 'name' })
  name: string;

  @ApiProperty({
    description: "list of pipeline's data sources",
    type: [DataSource],
  })
  @OneToMany(() => DataSource, (dataSource) => dataSource.pipeline, {
    eager: true,
  })
  dataSources: DataSource[];

  @Exclude()
  @OneToMany(() => Mixer, (mixer) => mixer.pipeline, {
    eager: true,
  })
  private _mixers: Mixer[];
  @ApiProperty({
    description: "specification of pipeline's mixers",
    type: MixerMap,
  })
  mixers: Record<string, Mixer>;
  @AfterLoad()
  populateMixers() {
    this.mixers = {};
    for (const mixer of this._mixers) {
      if (this.mixers[mixer.entity]) {
        throw new SeveralMixersPerEntityCollisionError(this.id, mixer.entity);
      }
      this.mixers[mixer.entity] = mixer;
    }
  }

  @ApiProperty({
    description: "list of pipeline's middlewares",
    type: [Middleware],
  })
  @OneToMany(() => Middleware, (middleware) => middleware.pipeline, {
    eager: true,
  })
  middlewares: Middleware[];

  @Exclude()
  @OneToMany(() => Mapper, (mapper) => mapper.pipeline, {
    eager: true,
  })
  private _mappers: Mapper[];
  @ApiProperty({
    description: "specification of pipeline's mappers",
    type: MapperMap,
  })
  mappers: Record<MapperCode, Mapper>;
  @AfterLoad()
  populateMappers() {
    this.mappers = {};
    for (const mapper of this._mappers) {
      this.mappers[mapper.code] = mapper;
    }
  }

  @ApiProperty({
    description: "list of pipeline's widgets",
    type: [Widget],
  })
  @OneToMany(() => Widget, (widget) => widget.pipeline, {
    eager: true,
  })
  widgets: Widget[];

  @ManyToOne(() => User)
  createdBy: User;
}
