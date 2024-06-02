import { TypeOrmModule } from '@nestjs/typeorm';
import { Widget } from '../../widgets/entities/widget.entity';
import { User } from '../../users/entities/user.entity';
import { Credential } from '../../users/entities/credential.entity';
import { Trace } from '../../trace/entities/trace.entity';
import { TracePiece } from '../../trace/entities/trace-piece.entity';

export const TestDbModule = TypeOrmModule.forRoot({
  type: 'sqlite',
  database: ':memory:',
  entities: [Widget, User, Credential, Trace, TracePiece],
});
