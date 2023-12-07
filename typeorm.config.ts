import { ConfigService } from '@nestjs/config';
import { config as dotEnvConfig } from 'dotenv';
import { DataSource as TypeOrmDataSource, DataSourceOptions } from 'typeorm';
import { Pipeline } from './src/pipelines/entities/pipeline.entity';
import { DataSource } from './src/data-sources/entities/data-source.entity';
import { Mapper } from './src/mappers/entities/mapper.entity';
import { Middleware } from './src/middlewares/entities/middleware.entity';
import { Mixer } from './src/mixers/entities/mixer.entity';
import { Widget } from './src/widgets/entities/widget.entity';
import { User } from './src/users/entities/user.entity';
import { Credential } from './src/users/entities/credential.entity';

dotEnvConfig();

const applicationConfig = new ConfigService();

export const config: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: applicationConfig.get<string>('DB_USERNAME'),
  password: applicationConfig.get<string>('DB_PASSWORD'),
  database: applicationConfig.get<string>('DB_NAME'),
  migrations: [`./migrations/*.ts`],
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
};

export const dataSource = new TypeOrmDataSource(config);
