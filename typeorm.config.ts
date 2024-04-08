import { ConfigService } from '@nestjs/config';
import { config as dotEnvConfig } from 'dotenv';
import { DataSource as TypeOrmDataSource, DataSourceOptions } from 'typeorm';
import { Widget } from './src/widgets/entities/widget.entity';
import { User } from './src/users/entities/user.entity';
import { Credential } from './src/users/entities/credential.entity';
import { Trace } from './src/trace/entities/trace.entity';
import { TracePiece } from './src/trace/entities/trace-piece.entity';

dotEnvConfig();

const applicationConfig = new ConfigService();

export const config: DataSourceOptions = {
  type: 'postgres',
  url: applicationConfig.get<string>('DB_URL'),
  host: applicationConfig.get<string>('DB_HOST'),
  port: applicationConfig.get<number>('DB_PORT'),
  username: applicationConfig.get<string>('DB_USERNAME'),
  password: applicationConfig.get<string>('DB_PASSWORD'),
  database: applicationConfig.get<string>('DB_NAME'),
  migrations: [`./migrations/*.ts`],
  entities: [Widget, User, Credential, Trace, TracePiece],
};

if (config.url && config.host && config.port) {
  console.warn(
    'You should either specify DB_URL, or DB_HOST and DB_PORT, not both',
  );
}

export const dataSource = new TypeOrmDataSource(config);
