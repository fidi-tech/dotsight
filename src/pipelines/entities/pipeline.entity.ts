import { DataSource } from '../../data-sources/entities/data-source.entity';
import { Mixer } from '../../mixers/entities/mixer.entity';
import { Middleware } from '../../middlewares/entities/middleware.entity';
import { Mapper, MapperId } from '../../mappers/entities/mapper.entity';

export type PipelineId = string;

type EntityId = string;

export class Pipeline {
  id: PipelineId;
  dataSources: Partial<Record<EntityId, DataSource[]>>;
  mixers: Partial<Record<EntityId, Mixer>>;
  middlewares: Partial<Record<EntityId, Middleware[]>>;
  mappers: Record<MapperId, Mapper>;
}
