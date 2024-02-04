import { TypeOrmModule } from '@nestjs/typeorm';
import { Widget } from '../../widgets/entities/widget.entity';
import { User } from '../../users/entities/user.entity';
import { Credential } from '../../users/entities/credential.entity';
import { DataSource } from '../../data-sources/entities/data-source.entity';

export const TestDbModule = TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  entities: [Widget, User, Credential, DataSource],
});
