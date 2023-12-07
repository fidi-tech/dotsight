import { TypeOrmModule } from '@nestjs/typeorm';
import { Pipeline } from '../../pipelines/entities/pipeline.entity';
import { DataSource } from '../../data-sources/entities/data-source.entity';
import { Mapper } from '../../mappers/entities/mapper.entity';
import { Middleware } from '../../middlewares/entities/middleware.entity';
import { Mixer } from '../../mixers/entities/mixer.entity';
import { Widget } from '../../widgets/entities/widget.entity';
import { User } from '../../users/entities/user.entity';
import { Credential } from '../../users/entities/credential.entity';

export const TestDbModule = TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  entities: [
    Pipeline,
    DataSource,
    Mapper,
    Middleware,
    Mixer,
    Widget,
    User,
    Credential,
  ],
});
